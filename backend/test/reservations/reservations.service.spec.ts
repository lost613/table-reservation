import { Test, TestingModule } from '@nestjs/testing';
import { ReservationsService } from '../../src/reservations/reservations.service';
import { CouchbaseService } from '../../src/couchbase/couchbase.service';
import { CreateReservationDto } from '../../src/reservations/dto/createReservation.dto';
import { UpdateReservationDto } from '../../src/reservations/dto/updateReservation.dto';
import { SearchReservationDto } from '../../src/reservations/dto/searchReservation.dto';

describe('ReservationsService', () => {
  let service: ReservationsService;
  let couchbaseService: jest.Mocked<CouchbaseService>;

  const mockUser = {
    id: 'user-1',
    name: 'Test User',
    phone: '1234567890',
    created: '2025-08-28T08:00:00Z',
    updated: '2025-08-28T08:00:00Z',
  };

  const mockReservation = {
    id: 'reservation-1',
    user: mockUser,
    tableSize: 4,
    expectedArrivalTime: '2025-08-28T10:00:00Z',
    status: 'Requested',
    created: '2025-08-28T08:00:00Z',
    updated: '2025-08-28T08:00:00Z',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationsService,
        {
          provide: CouchbaseService,
          useValue: {
            findUserById: jest.fn(),
            createReservation: jest.fn(),
            findReservationById: jest.fn(),
            updateReservationById: jest.fn(),
            findReservations: jest.fn(),
            removeReservationById: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ReservationsService>(ReservationsService);
    couchbaseService = module.get(CouchbaseService);
  });

  describe('create', () => {
    it('should create a new reservation', async () => {
      const createDto: CreateReservationDto = {
        user: 'user-1',
        tableSize: 4,
        expectedArrivalTime: '2025-08-28T10:00:00Z',
      };

      const reservationWithoutUser = {
        ...mockReservation,
        user: 'user-1',
      };

      const findUserById = jest.fn().mockResolvedValue(mockUser);
      const createReservation = jest
        .fn()
        .mockResolvedValue(reservationWithoutUser);

      jest
        .spyOn(couchbaseService, 'findUserById')
        .mockImplementation(findUserById);
      jest
        .spyOn(couchbaseService, 'createReservation')
        .mockImplementation(createReservation);

      const result = await service.create(createDto);

      expect(result).toEqual(mockReservation);
      expect(findUserById).toHaveBeenCalledWith('user-1', { lean: true });
      expect(createReservation).toHaveBeenCalledWith(createDto, {
        enforceRefCheck: 'throw',
      });
    });
  });

  describe('findById', () => {
    it('should find a reservation by id', async () => {
      const findReservationById = jest.fn().mockResolvedValue(mockReservation);
      jest
        .spyOn(couchbaseService, 'findReservationById')
        .mockImplementation(findReservationById);

      const result = await service.findById('reservation-1');

      expect(result).toEqual(mockReservation);
      expect(findReservationById).toHaveBeenCalledWith('reservation-1', {
        lean: true,
        populate: 'user',
      });
    });
  });

  describe('updateById', () => {
    it('should update an existing reservation', async () => {
      const updateDto: UpdateReservationDto = {
        status: 'Approved',
      };

      const updatedReservation = {
        ...mockReservation,
        ...updateDto,
        user: 'user-1',
      };

      const updateReservationById = jest
        .fn()
        .mockResolvedValue(updatedReservation);
      const findUserById = jest.fn().mockResolvedValue(mockUser);

      jest
        .spyOn(couchbaseService, 'updateReservationById')
        .mockImplementation(updateReservationById);
      jest
        .spyOn(couchbaseService, 'findUserById')
        .mockImplementation(findUserById);

      const result = await service.updateById('reservation-1', updateDto);

      expect(result).toEqual({
        ...updatedReservation,
        user: mockUser,
      });
      expect(updateReservationById).toHaveBeenCalledWith(
        'reservation-1',
        updateDto,
        {
          new: true,
        },
      );
      expect(findUserById).toHaveBeenCalledWith('user-1');
    });
  });

  describe('findAll', () => {
    it('should find all reservations with no filters', async () => {
      const findReservations = jest.fn().mockResolvedValue([mockReservation]);
      jest
        .spyOn(couchbaseService, 'findReservations')
        .mockImplementation(findReservations);

      const result = await service.findAll({});

      expect(result).toEqual([mockReservation]);
      expect(findReservations).toHaveBeenCalledWith(
        {},
        {
          lean: true,
          populate: 'user',
        },
      );
    });

    it('should find reservations with date filter', async () => {
      const searchDto = new SearchReservationDto();
      searchDto.expectedArrivalTime = '2025-08-28T10:00:00Z';

      const findReservations = jest.fn().mockResolvedValue([mockReservation]);
      jest
        .spyOn(couchbaseService, 'findReservations')
        .mockImplementation(findReservations);

      const result = await service.findAll(searchDto);

      expect(result).toEqual([mockReservation]);
      expect(findReservations).toHaveBeenCalledWith(
        {
          expectedArrivalTime: {
            $like: '%2025-08-28%',
          },
        },
        {
          lean: true,
          populate: 'user',
        },
      );
    });

    it('should find reservations with status filter', async () => {
      const searchDto = new SearchReservationDto();
      searchDto.status = 'Approved';

      const findReservations = jest.fn().mockResolvedValue([mockReservation]);
      jest
        .spyOn(couchbaseService, 'findReservations')
        .mockImplementation(findReservations);

      const result = await service.findAll(searchDto);

      expect(result).toEqual([mockReservation]);
      expect(findReservations).toHaveBeenCalledWith(
        {
          status: 'Approved',
        },
        {
          lean: true,
          populate: 'user',
        },
      );
    });

    it('should find reservations with user filter', async () => {
      const searchDto = new SearchReservationDto();
      searchDto.user = 'user-1';

      const findReservations = jest.fn().mockResolvedValue([mockReservation]);
      jest
        .spyOn(couchbaseService, 'findReservations')
        .mockImplementation(findReservations);

      const result = await service.findAll(searchDto);

      expect(result).toEqual([mockReservation]);
      expect(findReservations).toHaveBeenCalledWith(
        {
          user: 'user-1',
        },
        {
          lean: true,
          populate: 'user',
        },
      );
    });
  });

  describe('remove', () => {
    it('should remove a reservation', async () => {
      const removeReservationById = jest.fn().mockResolvedValue(undefined);
      jest
        .spyOn(couchbaseService, 'removeReservationById')
        .mockImplementation(removeReservationById);

      const result = await service.remove('reservation-1');

      expect(result).toBe(true);
      expect(removeReservationById).toHaveBeenCalledWith('reservation-1');
    });
  });
});
