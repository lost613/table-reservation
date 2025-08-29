import { gql } from '@urql/core';

export const GET_RESERVATIONS = gql`
  query GetReservations($search: SearchReservationDto) {
    reservations(searchReservationDto: $search) {
      id
      tableSize
      expectedArrivalTime
      status
      created
      updated
      name
      phone
      email
      gender
      comment
      user {
        id
        name
        phone
        email
        gender
      }
    }
  }
`;

export const EDIT_RESERVATION = gql`
  mutation EditReservation($id: String!, $updateReservationDto: UpdateReservationDto!) {
    editReservation(id: $id, updateReservationDto: $updateReservationDto) {
      id
      tableSize
      expectedArrivalTime
      status
      created
      updated
      name
      phone
      email
      gender
      comment
      user {
        id
        name
        phone
        email
        gender
      }
    }
  }
`;

export const ADD_RESERVATION = gql`
  mutation AddReservation($createReservationDto: CreateReservationDto!) {
    addReservation(createReservationDto: $createReservationDto) {
      id
      tableSize
      expectedArrivalTime
      status
      created
      updated
      name
      phone
      email
      gender
      comment
      user {
        id
        name
        phone
        email
        gender
      }
    }
  }
`;

export const REMOVE_RESERVATION = gql`
  mutation RemoveReservation($id: String!) {
    removeReservation(id: $id)
  }
`;

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  gender?: string;
  isEmployee?: boolean;
  created: string;
  updated: string;
}

export type ReservationStatus = 'Requested' | 'Approved' | 'Cancelled' | 'Completed';

export interface Reservation {
  id: string;
  user: User;
  tableSize: number;
  expectedArrivalTime: string;
  status: ReservationStatus;
  created: string;
  updated: string;
  name: string;
  phone: string;
  email?: string;
  gender?: string;
  comment?: string;
}

export interface SearchReservationDto {
  expectedArrivalTime?: string;
  status?: string;
  user?: string;
}

export interface CreateReservationDto {
  tableSize: number;
  expectedArrivalTime: string;
  user?: string;
  name: string;
  phone: string;
  gender: string;
  email?: string;
  comment?: string;
}

export interface UpdateReservationDto {
  tableSize?: number;
  expectedArrivalTime?: string;
  status?: string;
  name: string;
  phone: string;
  gender: string;
  email?: string;
  comment?: string;
}
