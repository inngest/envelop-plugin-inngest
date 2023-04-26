import { Prisma } from '@prisma/client';

export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  BigInt: number;
  Date: string;
  DateTime: string;
  JSON: Prisma.JsonValue;
  JSONObject: Prisma.JsonObject;
  Time: string;
};

export type Car = {
  __typename?: 'Car';
  id: Scalars['Int'];
  make: Scalars['String'];
  model: Scalars['String'];
  year: Scalars['Int'];
};

export type CreateCarInput = {
  make: Scalars['String'];
  model: Scalars['String'];
  year: Scalars['Int'];
};

export type Mutation = {
  __typename?: 'Mutation';
  createCar: Car;
  deleteCar: Car;
  updateCar: Car;
};

export type MutationcreateCarArgs = {
  input: CreateCarInput;
};

export type MutationdeleteCarArgs = {
  id: Scalars['Int'];
};

export type MutationupdateCarArgs = {
  id: Scalars['Int'];
  input: UpdateCarInput;
};

/** About the Redwood queries. */
export type Query = {
  __typename?: 'Query';
  car?: Maybe<Car>;
  cars: Array<Car>;
  /** Fetches the Redwood root schema. */
  redwood?: Maybe<Redwood>;
};

/** About the Redwood queries. */
export type QuerycarArgs = {
  id: Scalars['Int'];
};

/**
 * The RedwoodJS Root Schema
 *
 * Defines details about RedwoodJS such as the current user and version information.
 */
export type Redwood = {
  __typename?: 'Redwood';
  /** The current user. */
  currentUser?: Maybe<Scalars['JSON']>;
  /** The version of Prisma. */
  prismaVersion?: Maybe<Scalars['String']>;
  /** The version of Redwood. */
  version?: Maybe<Scalars['String']>;
};

export type UpdateCarInput = {
  make?: InputMaybe<Scalars['String']>;
  model?: InputMaybe<Scalars['String']>;
  year?: InputMaybe<Scalars['Int']>;
};

export type DeleteCarMutationVariables = Exact<{
  id: Scalars['Int'];
}>;

export type DeleteCarMutation = {
  __typename?: 'Mutation';
  deleteCar: { __typename?: 'Car'; id: number };
};

export type FindCarByIdVariables = Exact<{
  id: Scalars['Int'];
}>;

export type FindCarById = {
  __typename?: 'Query';
  car?: { __typename?: 'Car'; id: number; year: number; make: string; model: string } | null;
};

export type FindAllTheCarsVariables = Exact<{ [key: string]: never }>;

export type FindAllTheCars = {
  __typename?: 'Query';
  cars: Array<{ __typename?: 'Car'; id: number; year: number; make: string; model: string }>;
};

export type EditCarByIdVariables = Exact<{
  id: Scalars['Int'];
}>;

export type EditCarById = {
  __typename?: 'Query';
  car?: { __typename?: 'Car'; id: number; year: number; make: string; model: string } | null;
};

export type UpdateCarMutationVariables = Exact<{
  id: Scalars['Int'];
  input: UpdateCarInput;
}>;

export type UpdateCarMutation = {
  __typename?: 'Mutation';
  updateCar: { __typename?: 'Car'; id: number; year: number; make: string; model: string };
};

export type CreateCarMutationVariables = Exact<{
  input: CreateCarInput;
}>;

export type CreateCarMutation = {
  __typename?: 'Mutation';
  createCar: { __typename?: 'Car'; id: number };
};
