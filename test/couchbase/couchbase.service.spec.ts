import { Test, TestingModule } from '@nestjs/testing';
import { CouchbaseService } from 'src/couchbase/couchbase.service';
import { Ottoman } from 'ottoman';
import { BadRequestException } from '@nestjs/common';

describe('CouchbaseService', () => {
  let service: CouchbaseService;
  let mockOttoman: Ottoman;
  let mockCodeModel: any;
  let mockUserModel: any;
  let mockReservationModel: any;

  beforeEach(async () => {
    mockCodeModel = {
      findOneAndUpdate: jest.fn(),
      findOne: jest.fn(),
      removeById: jest.fn(),
    };

    mockUserModel = {
      findOne: jest.fn(),
      create: jest.fn(),
      findById: jest.fn(),
      findOneAndUpdate: jest.fn(),
    };

    mockReservationModel = {
      create: jest.fn(),
      findById: jest.fn(),
      find: jest.fn(),
      findOneAndUpdate: jest.fn(),
      removeById: jest.fn(),
    };

    mockOttoman = {
      model: jest.fn().mockImplementation((name) => {
        switch (name) {
          case 'code':
            return mockCodeModel;
          case 'user':
            return mockUserModel;
          case 'reservation':
            return mockReservationModel;
          default:
            return null;
        }
      }),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CouchbaseService,
        {
          provide: 'Couchbase',
          useValue: mockOttoman,
        },
      ],
    }).compile();

    service = module.get<CouchbaseService>(CouchbaseService);
  });

  describe('upsertCode', () => {
    it('should upsert code successfully', async () => {
      const phone = '1234567890';
      const code = '123456';
      const mockResult = { id: '1', phone, code };

      mockCodeModel.findOneAndUpdate.mockResolvedValue(mockResult);

      const result = await service.upsertCode(phone, code);

      expect(mockCodeModel.findOneAndUpdate).toHaveBeenCalledWith(
        { phone },
        { phone, code },
        { maxExpiry: 300, upsert: true, new: true },
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('checkCodeByPhone', () => {
    it('should verify code successfully', async () => {
      const phone = '1234567890';
      const code = '123456';
      const mockResult = { id: '1', code };

      mockCodeModel.findOne.mockResolvedValue(mockResult);
      mockCodeModel.removeById.mockResolvedValue(true);

      const result = await service.checkCodeByPhone(phone, code);

      expect(mockCodeModel.findOne).toHaveBeenCalledWith({ phone });
      expect(mockCodeModel.removeById).toHaveBeenCalledWith('1');
      expect(result).toBe(true);
    });

    it('should throw BadRequestException when code is expired', async () => {
      const phone = '1234567890';
      const code = '123456';

      mockCodeModel.findOne.mockRejectedValue({
        message: 'document not found',
      });

      await expect(service.checkCodeByPhone(phone, code)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findUserByPhone', () => {
    it('should find user by phone successfully', async () => {
      const phone = '1234567890';
      const mockUser = { id: '1', phone, name: 'Test User' };

      mockUserModel.findOne.mockResolvedValue(mockUser);

      const result = await service.findUserByPhone(phone);

      expect(mockUserModel.findOne).toHaveBeenCalledWith({ phone });
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      const phone = '1234567890';

      mockUserModel.findOne.mockRejectedValue({
        message: 'document not found',
      });

      const result = await service.findUserByPhone(phone);

      expect(result).toBeNull();
    });
  });

  describe('createUser', () => {
    it('should create user successfully', async () => {
      const userData = { phone: '1234567890', name: 'Test User' };
      const mockUser = { id: '1', ...userData };

      mockUserModel.findOne.mockResolvedValue(null);
      mockUserModel.create.mockResolvedValue(mockUser);

      const result = await service.createUser(userData);

      expect(mockUserModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          ...userData,
          created: expect.any(String),
          updated: expect.any(String),
        }),
        undefined,
      );
      expect(result).toEqual(mockUser);
    });

    it('should throw BadRequestException when phone number exists', async () => {
      const userData = { phone: '1234567890', name: 'Test User' };

      mockUserModel.findOne.mockResolvedValue({ id: '1' });

      await expect(service.createUser(userData)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('createReservation', () => {
    it('should create reservation successfully', async () => {
      const reservationData = {
        user: { id: '1', name: 'Test User' },
        tableSize: 4,
        expectedArrivalTime: '2025-08-28T10:00:00Z',
      };
      const mockReservation = { id: '1', ...reservationData };

      mockReservationModel.create.mockResolvedValue(mockReservation);

      const result = await service.createReservation(reservationData);

      expect(mockReservationModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          ...reservationData,
          created: expect.any(String),
          updated: expect.any(String),
        }),
        undefined,
      );
      expect(result).toEqual(mockReservation);
    });
  });

  describe('findUserById', () => {
    it('should find user by id successfully', async () => {
      const userId = '1';
      const mockUser = {
        id: userId,
        name: 'Test User',
        phone: '1234567890',
      };

      const spy = jest
        .spyOn(mockUserModel, 'findById')
        .mockResolvedValue(mockUser);

      const result = await service.findUserById(userId);

      expect(spy).toHaveBeenCalledWith(userId, undefined);
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      const userId = 'non-existent';

      const findById = jest.fn().mockRejectedValue({
        message: 'document not found',
      });
      jest.spyOn(mockUserModel, 'findById').mockImplementation(findById);

      const result = await service.findUserById(userId);

      expect(result).toBeNull();
    });
  });

  describe('findReservations', () => {
    it('should find reservations successfully', async () => {
      const mockReservations = [
        { id: '1', tableSize: 4 },
        { id: '2', tableSize: 2 },
      ];

      const find = jest.fn().mockResolvedValue({ rows: mockReservations });
      jest.spyOn(mockReservationModel, 'find').mockImplementation(find);

      const result = await service.findReservations();

      expect(find).toHaveBeenCalled();
      expect(result).toEqual(mockReservations);
    });
  });

  describe('updateReservationById', () => {
    it('should update reservation successfully', async () => {
      const id = '1';
      const updateData = { tableSize: 6, status: 'Approved' };
      const mockReservation = { id, ...updateData };

      const findById = jest.fn().mockResolvedValue({ id });
      const findOneAndUpdate = jest.fn().mockResolvedValue(mockReservation);

      jest.spyOn(mockReservationModel, 'findById').mockImplementation(findById);
      jest
        .spyOn(mockReservationModel, 'findOneAndUpdate')
        .mockImplementation(findOneAndUpdate);

      const result = await service.updateReservationById(id, updateData);

      expect(findOneAndUpdate).toHaveBeenCalledWith(
        { id },
        expect.objectContaining({
          ...updateData,
          updated: expect.any(String),
        }),
        undefined,
      );
      expect(result).toEqual(mockReservation);
    });

    it('should throw BadRequestException when reservation not found', async () => {
      const id = '1';
      const updateData = { tableSize: 6 };

      const findById = jest.fn().mockRejectedValue({
        message: 'not found',
      });
      jest.spyOn(mockReservationModel, 'findById').mockImplementation(findById);

      await expect(
        service.updateReservationById(id, updateData),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('removeReservationById', () => {
    it('should remove reservation successfully', async () => {
      const id = '1';

      const removeById = jest.fn().mockResolvedValue(true);
      jest
        .spyOn(mockReservationModel, 'removeById')
        .mockImplementation(removeById);

      const result = await service.removeReservationById(id);

      expect(removeById).toHaveBeenCalledWith(id, undefined);
      expect(result).toBe(true);
    });
  });
});
