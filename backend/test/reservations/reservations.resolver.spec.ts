import { Test, TestingModule } from '@nestjs/testing';
import { ReservationsResolver } from 'src/reservations/reservations.resolver';
import { ReservationsService } from 'src/reservations/reservations.service';
import { ClsService } from 'nestjs-cls';
import { CreateReservationDto } from 'src/reservations/dto/createReservation.dto';
import { UpdateReservationDto } from 'src/reservations/dto/updateReservation.dto';
import { SearchReservationDto } from 'src/reservations/dto/searchReservation.dto';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Reservation } from 'src/reservations/models/reservation.model';

describe('ReservationsResolver', () => {
  let resolver: ReservationsResolver;
  let reservationsService: jest.Mocked<ReservationsService>;
  let clsService: jest.Mocked<ClsService>;

  const mockUser = {
    sub: 'user-1',
    isEmployee: false,
  };

  const mockEmployeeUser = {
    sub: 'employee-1',
    isEmployee: true,
  };

  const mockReservation: Reservation = {
    id: 'reservation-1',
    user: {
      id: 'user-1',
      name: 'Test User',
      phone: '1234567890',
      created: '2025-08-28T08:00:00Z',
      updated: '2025-08-28T08:00:00Z',
    },
    tableSize: 4,
    expectedArrivalTime: '2025-08-28T10:00:00Z',
    status: 'Requested',
    created: '2025-08-28T08:00:00Z',
    updated: '2025-08-28T08:00:00Z',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationsResolver,
        {
          provide: ReservationsService,
          useValue: {
            findById: jest.fn(),
            findAll: jest.fn(),
            create: jest.fn(),
            updateById: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: ClsService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    resolver = module.get<ReservationsResolver>(ReservationsResolver);
    reservationsService = module.get(ReservationsService);
    clsService = module.get(ClsService);
  });

  describe('reservation', () => {
    it('should return a reservation by id for the owner', async () => {
      clsService.get.mockReturnValue(mockUser);
      const spy = jest
        .spyOn(reservationsService, 'findById')
        .mockResolvedValue(mockReservation);

      const result = await resolver.reservation('reservation-1');

      expect(result).toEqual(mockReservation);
      expect(spy).toHaveBeenCalledWith('reservation-1');
    });

    it('should return a reservation by id for an employee', async () => {
      clsService.get.mockReturnValue(mockEmployeeUser);
      reservationsService.findById.mockResolvedValue(mockReservation);

      const result = await resolver.reservation('reservation-1');

      expect(result).toEqual(mockReservation);
    });

    it('should throw NotFoundException when reservation not found', async () => {
      clsService.get.mockReturnValue(mockUser);
      reservationsService.findById.mockResolvedValue(null as any);

      await expect(resolver.reservation('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException for non-owner non-employee', async () => {
      clsService.get.mockReturnValue({
        sub: 'other-user',
        isEmployee: false,
      });
      reservationsService.findById.mockResolvedValue(mockReservation);

      await expect(resolver.reservation('reservation-1')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('reservations', () => {
    const searchDto = new SearchReservationDto();

    it('should return all reservations for employee', async () => {
      const mockReservations = [mockReservation];
      clsService.get.mockReturnValue(mockEmployeeUser);
      const spy = jest
        .spyOn(reservationsService, 'findAll')
        .mockResolvedValue(mockReservations);

      const result = await resolver.reservations(searchDto);

      expect(result).toEqual(mockReservations);
      expect(spy).toHaveBeenCalledWith(searchDto);
    });

    it('should return only user reservations for non-employee', async () => {
      const mockReservations = [mockReservation];
      clsService.get.mockReturnValue(mockUser);
      const spy = jest
        .spyOn(reservationsService, 'findAll')
        .mockResolvedValue(mockReservations);

      const result = await resolver.reservations(searchDto);

      expect(result).toEqual(mockReservations);
      expect(spy).toHaveBeenCalledWith({
        ...searchDto,
        user: mockUser.sub,
      });
    });
  });

  describe('addReservation', () => {
    const createDto = new CreateReservationDto();

    it('should create a new reservation', async () => {
      clsService.get.mockReturnValue(mockUser);
      const spy = jest
        .spyOn(reservationsService, 'create')
        .mockResolvedValue(mockReservation);

      const result = await resolver.addReservation(createDto);

      expect(result).toEqual(mockReservation);
      expect(spy).toHaveBeenCalledWith({
        ...createDto,
        user: mockUser.sub,
      });
    });
  });

  describe('editReservation', () => {
    const updateDto = new UpdateReservationDto();

    it('should update an existing reservation', async () => {
      clsService.get.mockReturnValue(mockUser);
      reservationsService.findById.mockResolvedValue(mockReservation);
      const spy = jest
        .spyOn(reservationsService, 'updateById')
        .mockResolvedValue({
          ...mockReservation,
          ...updateDto,
        });

      const result = await resolver.editReservation('reservation-1', updateDto);

      expect(result).toEqual({ ...mockReservation, ...updateDto });
      expect(spy).toHaveBeenCalledWith('reservation-1', updateDto);
    });

    it('should throw NotFoundException when reservation not found', async () => {
      clsService.get.mockReturnValue(mockUser);
      reservationsService.findById.mockResolvedValue(null as any);

      await expect(
        resolver.editReservation('non-existent', updateDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException for non-owner non-employee', async () => {
      clsService.get.mockReturnValue({
        sub: 'other-user',
        isEmployee: false,
      });
      reservationsService.findById.mockResolvedValue(mockReservation);

      await expect(
        resolver.editReservation('reservation-1', updateDto),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('removeReservation', () => {
    it('should remove an existing reservation', async () => {
      clsService.get.mockReturnValue(mockUser);
      reservationsService.findById.mockResolvedValue(mockReservation);
      const spy = jest
        .spyOn(reservationsService, 'remove')
        .mockResolvedValue(true);

      const result = await resolver.removeReservation('reservation-1');

      expect(result).toBe(true);
      expect(spy).toHaveBeenCalledWith('reservation-1');
    });

    it('should throw NotFoundException when reservation not found', async () => {
      clsService.get.mockReturnValue(mockUser);
      reservationsService.findById.mockResolvedValue(null as any);

      await expect(resolver.removeReservation('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException for non-owner non-employee', async () => {
      clsService.get.mockReturnValue({
        sub: 'other-user',
        isEmployee: false,
      });
      reservationsService.findById.mockResolvedValue(mockReservation);

      await expect(resolver.removeReservation('reservation-1')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('checkAndGetReservation', () => {
    it('should return reservation for owner', async () => {
      clsService.get.mockReturnValue(mockUser);
      reservationsService.findById.mockResolvedValue(mockReservation);

      const result = await resolver.checkAndGetReservation('reservation-1');

      expect(result).toEqual(mockReservation);
    });

    it('should return reservation for employee', async () => {
      clsService.get.mockReturnValue(mockEmployeeUser);
      reservationsService.findById.mockResolvedValue(mockReservation);

      const result = await resolver.checkAndGetReservation('reservation-1');

      expect(result).toEqual(mockReservation);
    });

    it('should throw NotFoundException when reservation not found', async () => {
      clsService.get.mockReturnValue(mockUser);
      reservationsService.findById.mockResolvedValue(null as any);

      await expect(
        resolver.checkAndGetReservation('non-existent'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException for non-owner non-employee', async () => {
      clsService.get.mockReturnValue({
        sub: 'other-user',
        isEmployee: false,
      });
      reservationsService.findById.mockResolvedValue(mockReservation);

      await expect(
        resolver.checkAndGetReservation('reservation-1'),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
