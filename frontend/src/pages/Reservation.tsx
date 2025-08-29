import {
  Component,
  createEffect,
  createResource,
  For,
  Show,
  onMount,
  createSignal,
} from "solid-js";
import { createClient, cacheExchange, fetchExchange } from "@urql/core";
import {
  GET_RESERVATIONS,
  EDIT_RESERVATION,
  Reservation,
  UpdateReservationDto,
} from "../services/graphql";
import styles from "./Reservation.module.css";
import { navigate, initializeNavigation } from "../utils/navigation";
import { useNavigate } from "@solidjs/router";
import { jwtDecode } from "jwt-decode";

// 创建 URQL 客户端
const client = createClient({
  url: "/api/graphql", // 使用 vite 配置的代理路径
  exchanges: [cacheExchange, fetchExchange],
  fetchOptions: () => {
    const token = localStorage.getItem("access_token");
    return {
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
        "x-apollo-operation-name": "GetReservations", // 添加 Apollo 操作名称
        "apollo-require-preflight": "true", // 添加 Apollo 预检请求头
        "Cache-Control": "no-cache", // 禁用缓存
        Pragma: "no-cache",
      },
    };
  },
  requestPolicy: "cache-and-network", // 默认策略：先使用缓存，同时发起网络请求
});

const ReservationPage: Component = () => {
  const navigateHook = useNavigate();
  const [isEmployee, setIsEmployee] = createSignal(false);
  const [showEditModal, setShowEditModal] = createSignal(false);
  const [showDetailModal, setShowDetailModal] = createSignal(false);
  const [editingReservation, setEditingReservation] =
    createSignal<Reservation | null>(null);
  const [detailReservation, setDetailReservation] =
    createSignal<Reservation | null>(null);
  const [editForm, setEditForm] = createSignal({
    expectedArrivalTime: "",
    tableSize: 0,
  });
  
  // 过滤器状态
  const [filterDate, setFilterDate] = createSignal("");
  const [filterStatus, setFilterStatus] = createSignal("");

  onMount(() => {
    initializeNavigation(navigateHook);

    // 解析token获取用户角色
    const token = localStorage.getItem("access_token");
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        setIsEmployee(decoded.isEmployee || false);
      } catch (error) {
        console.error("Error decoding token:", error);
        setIsEmployee(false);
      }
    }
  });

  // 检查认证状态
  createEffect(() => {
    if (!localStorage.getItem("access_token")) {
      navigate("/");
    }
  });

  // 过滤器变化时自动重新查询
  createEffect(() => {
    // 监听过滤器变化
    filterDate();
    filterStatus();
    // 当过滤器变化时，延迟一点时间后重新查询，避免频繁请求
    const timer = setTimeout(() => {
      refetch();
    }, 300);
    
    return () => clearTimeout(timer);
  });

  // 获取预订列表数据
  const [reservations, { refetch }] = createResource<Reservation[]>(
    async () => {
      try {
        console.log("Fetching reservations...");
        
        // 构建搜索参数
        const search: any = {};
        if (filterDate()) {
          // 将日期转换为ISO字符串格式
          search.expectedArrivalTime = new Date(filterDate()).toISOString();
        }
        if (filterStatus()) {
          search.status = filterStatus();
        }
        
        const response = await client
          .query(GET_RESERVATIONS, {
            search,
            requestPolicy: "network-only", // 每次都从网络获取以确保过滤器生效
          })
          .toPromise();

        if (response.error) {
          console.error("GraphQL Error:", response.error);
          throw response.error;
        }

        if (!response.data) {
          console.error("No data received");
          return [];
        }

        // 按预计到达时间增序排序
        return [...response.data.reservations].sort((a, b) => {
          const timeA = new Date(a.expectedArrivalTime).getTime();
          const timeB = new Date(b.expectedArrivalTime).getTime();
          return timeA - timeB;
        });
      } catch (error) {
        console.error("Error fetching reservations:", error);
        throw error;
      }
    }
  );

  // 处理登出
  const handleLogout = () => {
    if (confirm("确定要退出登录吗？")) {
      localStorage.removeItem("access_token");
      navigate("/");
    }
  };

  // 处理刷新
  const handleRefresh = async () => {
    try {
      // 强制从网络重新获取数据
      await refetch();
    } catch (error) {
      console.error("Error refreshing data:", error);
    }
  };

  // 更新预订状态
  const updateReservationStatus = async (id: string, status: string) => {
    try {
      const updateDto: UpdateReservationDto = { status };
      const response = await client
        .mutation(EDIT_RESERVATION, {
          id,
          updateReservationDto: updateDto,
        })
        .toPromise();

      if (response.error) {
        console.error("Error updating reservation:", response.error);
        alert("更新失败: " + response.error.message);
        return;
      }

      // 更新成功后刷新数据
      await refetch();
      alert("状态更新成功");
    } catch (error) {
      console.error("Error updating reservation:", error);
      alert("更新失败");
    }
  };

  // 打开编辑对话框
  const openDetailModal = (reservation: Reservation) => {
    setDetailReservation(reservation);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setDetailReservation(null);
  };

  const openEditModal = (reservation: Reservation) => {
    setEditingReservation(reservation);
    // 将 ISO 时间字符串转换为本地时间，格式化为 datetime-local 输入格式
    const date = new Date(reservation.expectedArrivalTime);
    // 获取本地时区偏移量（分钟）
    const timezoneOffset = date.getTimezoneOffset();
    // 调整为本地时间
    const localDate = new Date(date.getTime() - timezoneOffset * 60000);
    // 格式化为 datetime-local 所需的格式 YYYY-MM-DDTHH:mm
    const formattedDateTime = localDate.toISOString().slice(0, 16);

    setEditForm({
      expectedArrivalTime: formattedDateTime,
      tableSize: reservation.tableSize,
    });
    setShowEditModal(true);
  };

  // 关闭编辑对话框
  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingReservation(null);
  };

  // 保存编辑
  const saveEdit = async () => {
    const reservation = editingReservation();
    if (!reservation) return;

    try {
      // 将 datetime-local 格式转换为 ISO 字符串格式
      const selectedDateTime = new Date(editForm().expectedArrivalTime);
      const isoDateTime = selectedDateTime.toISOString();

      const updateDto: UpdateReservationDto = {
        expectedArrivalTime: isoDateTime,
        tableSize: editForm().tableSize,
      };

      const response = await client
        .mutation(EDIT_RESERVATION, {
          id: reservation.id,
          updateReservationDto: updateDto,
        })
        .toPromise();

      if (response.error) {
        console.error("Error updating reservation:", response.error);
        alert("更新失败: " + response.error.message);
        return;
      }

      // 更新成功后刷新数据并关闭对话框
      await refetch();
      closeEditModal();
      alert("预订信息更新成功");
    } catch (error) {
      console.error("Error updating reservation:", error);
      alert("更新失败");
    }
  };

  return (
    <div class={styles.container}>
      <div class={styles.header}>
        <h1>预定列表</h1>
        <div class={styles.headerButtons}>
          <button class={styles.refreshButton} onClick={handleRefresh}>
            刷新
          </button>
          <button class={styles.logoutButton} onClick={handleLogout}>
            退出登录
          </button>
        </div>
      </div>

      {/* 过滤器 - 只有员工才能看到 */}
      <Show when={isEmployee()}>
        <div class={styles.filterContainer}>
          <div class={styles.filterGroup}>
            <label class={styles.filterLabel}>预计到达时间：</label>
            <input
              type="date"
              class={styles.filterInput}
              value={filterDate()}
              onInput={(e) => setFilterDate(e.target.value)}
            />
          </div>
          <div class={styles.filterGroup}>
            <label class={styles.filterLabel}>状态：</label>
            <select
              class={styles.filterSelect}
              value={filterStatus()}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">全部</option>
              <option value="Requested">待确认</option>
              <option value="Approved">已确认</option>
              <option value="Cancelled">已取消</option>
              <option value="Completed">已完成</option>
            </select>
          </div>
          <div class={styles.filterActions}>
            <button 
              class={styles.clearButton}
              onClick={() => {
                setFilterDate("");
                setFilterStatus("");
              }}
            >
              清除过滤
            </button>
          </div>
        </div>
      </Show>

      <div class={styles.tableContainer}>
        <Show
          when={!reservations.loading}
          fallback={<div class={styles.loading}>加载中...</div>}
        >
          <Show
            when={!reservations.error}
            fallback={
              <div class={styles.error}>
                加载失败: {reservations.error?.message}
                <button onClick={handleRefresh}>重试</button>
              </div>
            }
          >
            <Show
              when={reservations() && reservations()!.length > 0}
              fallback={<div class={styles.empty}>暂无预定记录</div>}
            >
              <table class={styles.table}>
                <thead>
                  <tr>
                    <th>预计到达时间</th>
                    <th>就餐人数</th>
                    <th>状态</th>
                    <th>创建时间</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  <For each={reservations()}>
                    {(reservation) => (
                      <tr>
                        <td>
                          {new Date(
                            reservation.expectedArrivalTime
                          ).toLocaleString("zh-CN", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td>{reservation.tableSize}</td>
                        <td
                          class={
                            styles[`status-${reservation.status.toLowerCase()}`]
                          }
                        >
                          {getStatusText(reservation.status)}
                        </td>
                        <td>
                          {new Date(reservation.created).toLocaleString()}
                        </td>
                        <td class={styles.actions}>
                          {isEmployee() ? (
                            // 员工角色：显示详情，确认，取消，完成按钮
                            <>
                              <button
                                class={styles.actionButton}
                                onClick={() => openDetailModal(reservation)}
                              >
                                详情
                              </button>
                              {reservation.status === "Requested" && (
                                <button
                                  class={`${styles.actionButton} ${styles.approveButton}`}
                                  onClick={() =>
                                    updateReservationStatus(
                                      reservation.id,
                                      "Approved"
                                    )
                                  }
                                >
                                  确认
                                </button>
                              )}
                              {["Requested", "Approved"].includes(
                                reservation.status
                              ) && (
                                <>
                                  <button
                                    class={`${styles.actionButton} ${styles.cancelButton}`}
                                    onClick={() => {
                                      if (confirm("确定要取消这个预订吗？")) {
                                        updateReservationStatus(
                                          reservation.id,
                                          "Cancelled"
                                        );
                                      }
                                    }}
                                  >
                                    取消
                                  </button>
                                  <button
                                    class={`${styles.actionButton} ${styles.completeButton}`}
                                    onClick={() => {
                                      if (confirm("确定要完成这个预订吗？")) {
                                        updateReservationStatus(
                                          reservation.id,
                                          "Completed"
                                        );
                                      }
                                    }}
                                  >
                                    完成
                                  </button>
                                </>
                              )}
                              {["Cancelled", "Completed"].includes(
                                reservation.status
                              ) && (
                                <span class={styles.noActions}>无可用操作</span>
                              )}
                            </>
                          ) : (
                            // 非员工角色：显示取消和编辑按钮
                            <>
                              {["Requested", "Approved"].includes(
                                reservation.status
                              ) ? (
                                <>
                                  <button
                                    class={`${styles.actionButton} ${styles.cancelButton}`}
                                    onClick={() => {
                                      if (confirm("确定要取消这个预订吗？")) {
                                        updateReservationStatus(
                                          reservation.id,
                                          "Cancelled"
                                        );
                                      }
                                    }}
                                  >
                                    取消
                                  </button>
                                  <button
                                    class={`${styles.actionButton} ${styles.editButton}`}
                                    onClick={() => openEditModal(reservation)}
                                  >
                                    编辑
                                  </button>
                                </>
                              ) : (
                                <span class={styles.noActions}>无可用操作</span>
                              )}
                            </>
                          )}
                        </td>
                      </tr>
                    )}
                  </For>
                </tbody>
              </table>
            </Show>
          </Show>
        </Show>
      </div>

      {/* 编辑对话框 */}
      <Show when={showEditModal()}>
        <div class={styles.modal}>
          <div class={styles.modalContent}>
            <div class={styles.modalHeader}>
              <h3>编辑预订信息</h3>
            </div>

            <div class={styles.formGroup}>
              <label>预计到达时间</label>
              <input
                type="datetime-local"
                value={editForm().expectedArrivalTime}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    expectedArrivalTime: e.target.value,
                  }))
                }
              />
            </div>

            <div class={styles.formGroup}>
              <label>人数</label>
              <input
                type="number"
                min="1"
                max="20"
                value={editForm().tableSize}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    tableSize: parseInt(e.target.value) || 1,
                  }))
                }
              />
            </div>

            <div class={styles.modalActions}>
              <button
                class={`${styles.modalButton} ${styles.cancelModalButton}`}
                onClick={closeEditModal}
              >
                取消
              </button>
              <button
                class={`${styles.modalButton} ${styles.saveButton}`}
                onClick={saveEdit}
              >
                保存
              </button>
            </div>
          </div>
        </div>
      </Show>

      {/* 详情对话框 */}
      <Show when={showDetailModal()}>
        <div class={styles.modalOverlay} onClick={closeDetailModal}>
          <div class={styles.detailModal} onClick={(e) => e.stopPropagation()}>
            <h3>预订详情</h3>
            <Show when={detailReservation()}>
              {(reservation) => (
                <div class={styles.detailContent}>
                  <div class={styles.detailRow}>
                    <span class={styles.detailLabel}>客人姓名：</span>
                    <span class={styles.detailValue}>
                      {reservation().user.name}
                    </span>
                  </div>
                  <div class={styles.detailRow}>
                    <span class={styles.detailLabel}>电话：</span>
                    <span class={styles.detailValue}>
                      {reservation().user.phone}
                    </span>
                  </div>
                  <div class={styles.detailRow}>
                    <span class={styles.detailLabel}>性别：</span>
                    <span class={styles.detailValue}>
                      {getGenderText(reservation().user.gender)}
                    </span>
                  </div>
                  <div class={styles.detailRow}>
                    <span class={styles.detailLabel}>邮箱：</span>
                    <span class={styles.detailValue}>
                      {reservation().user.email || '未填写'}
                    </span>
                  </div>
                  <div class={styles.detailRow}>
                    <span class={styles.detailLabel}>预计到达时间：</span>
                    <span class={styles.detailValue}>
                      {new Date(
                        reservation().expectedArrivalTime
                      ).toLocaleString("zh-CN", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div class={styles.detailRow}>
                    <span class={styles.detailLabel}>就餐人数：</span>
                    <span class={styles.detailValue}>
                      {reservation().tableSize}人
                    </span>
                  </div>
                  <div class={styles.detailRow}>
                    <span class={styles.detailLabel}>预订状态：</span>
                    <span class={styles.detailValue}>
                      {getStatusText(reservation().status)}
                    </span>
                  </div>
                  <div class={styles.detailRow}>
                    <span class={styles.detailLabel}>创建时间：</span>
                    <span class={styles.detailValue}>
                      {new Date(reservation().created).toLocaleString("zh-CN", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <Show when={reservation().updated}>
                    <div class={styles.detailRow}>
                      <span class={styles.detailLabel}>更新时间：</span>
                      <span class={styles.detailValue}>
                        {new Date(reservation().updated!).toLocaleString(
                          "zh-CN",
                          {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </span>
                    </div>
                  </Show>
                </div>
              )}
            </Show>
            <div class={styles.modalActions}>
              <button
                class={`${styles.modalButton} ${styles.cancelModalButton}`}
                onClick={closeDetailModal}
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      </Show>
    </div>
  );
};

function getStatusText(status: string): string {
  switch (status) {
    case "Requested":
      return "待确认";
    case "Approved":
      return "已确认";
    case "Cancelled":
      return "已取消";
    case "Completed":
      return "已完成";
    default:
      return status;
  }
}

function getGenderText(gender?: string): string {
  if (!gender) return '未填写';
  
  switch (gender.toUpperCase()) {
    case 'M':
    case 'MALE':
      return '男';
    case 'F':
    case 'FEMALE':
      return '女';
    default:
      return gender;
  }
}

export default ReservationPage;
