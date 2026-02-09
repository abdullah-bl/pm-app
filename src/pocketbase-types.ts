/**
* This file was @generated using pocketbase-typegen
*/

import type PocketBase from 'pocketbase'
import type { RecordService } from 'pocketbase'

export enum Collections {
	Authorigins = "_authOrigins",
	Externalauths = "_externalAuths",
	Mfas = "_mfas",
	Otps = "_otps",
	Superusers = "_superusers",
	BudgetItems = "budget_items",
	Budgets = "budgets",
	Obligations = "obligations",
	Payments = "payments",
	Phases = "phases",
	ProjectLogs = "project_logs",
	Projects = "projects",
	Transfers = "transfers",
	Users = "users",
}

// Alias types for improved usability
export type IsoDateString = string
export type IsoAutoDateString = string & { readonly autodate: unique symbol }
export type RecordIdString = string
export type FileNameString = string & { readonly filename: unique symbol }
export type HTMLString = string

type ExpandType<T> = unknown extends T
	? T extends unknown
		? { expand?: unknown }
		: { expand: T }
	: { expand: T }

// System fields
export type BaseSystemFields<T = unknown> = {
	id: RecordIdString
	collectionId: string
	collectionName: Collections
} & ExpandType<T>

export type AuthSystemFields<T = unknown> = {
	email: string
	emailVisibility: boolean
	username: string
	verified: boolean
} & BaseSystemFields<T>

// Record types for each collection

export type AuthoriginsRecord = {
	collectionRef: string
	created: IsoAutoDateString
	fingerprint: string
	id: string
	recordRef: string
	updated: IsoAutoDateString
}

export type ExternalauthsRecord = {
	collectionRef: string
	created: IsoAutoDateString
	id: string
	provider: string
	providerId: string
	recordRef: string
	updated: IsoAutoDateString
}

export type MfasRecord = {
	collectionRef: string
	created: IsoAutoDateString
	id: string
	method: string
	recordRef: string
	updated: IsoAutoDateString
}

export type OtpsRecord = {
	collectionRef: string
	created: IsoAutoDateString
	id: string
	password: string
	recordRef: string
	sentTo?: string
	updated: IsoAutoDateString
}

export type SuperusersRecord = {
	created: IsoAutoDateString
	email: string
	emailVisibility?: boolean
	id: string
	password: string
	tokenKey: string
	updated: IsoAutoDateString
	verified?: boolean
}

export type BudgetItemsRecord = {
	budget: RecordIdString
	cash?: number
	cost?: number
	created: IsoAutoDateString
	id: string
	note?: string
	updated: IsoAutoDateString
	year: number
}

export type BudgetsRecord = {
	created: IsoAutoDateString
	description?: string
	id: string
	name?: string
	ref?: string
	updated: IsoAutoDateString
}

export type ObligationsRecord = {
	budget?: RecordIdString
	cash?: number
	cost?: number
	created: IsoAutoDateString
	date?: IsoDateString
	files?: FileNameString[]
	id: string
	name?: string
	note?: string
	project?: RecordIdString
	ref?: string
	updated: IsoAutoDateString
}

export enum PaymentsStatusOptions {
	"planned" = "planned",
	"pending" = "pending",
	"paid" = "paid",
}
export type PaymentsRecord = {
	amount?: number
	created: IsoAutoDateString
	due_date?: IsoDateString
	files?: FileNameString[]
	id: string
	name?: string
	obligation?: RecordIdString
	project?: RecordIdString
	ref?: string
	status?: PaymentsStatusOptions
	updated: IsoAutoDateString
}

export type PhasesRecord = {
	color?: string
	created: IsoAutoDateString
	description?: string
	id: string
	name?: string
	order?: number
	updated: IsoAutoDateString
}

export type ProjectLogsRecord = {
	by: RecordIdString
	created: IsoAutoDateString
	id: string
	note?: string
	phase: RecordIdString
	previous_phase: RecordIdString
	project: RecordIdString
	updated: IsoAutoDateString
}

export type ProjectsRecord = {
	active?: boolean
	assignee?: RecordIdString[]
	created: IsoAutoDateString
	description?: string
	duration?: number
	end_date?: IsoDateString
	files?: FileNameString[]
	id: string
	name?: string
	phase?: RecordIdString
	ref?: string
	slug?: string
	start_date?: IsoDateString
	total?: number
	updated: IsoAutoDateString
}

export type TransfersRecord = {
	cash?: number
	cost?: number
	created: IsoAutoDateString
	date?: IsoDateString
	files?: FileNameString[]
	from?: RecordIdString
	id: string
	note?: string
	to?: RecordIdString
	updated: IsoAutoDateString
}

export type UsersRecord = {
	avatar?: FileNameString
	created: IsoAutoDateString
	email: string
	emailVisibility?: boolean
	id: string
	name?: string
	password: string
	tokenKey: string
	updated: IsoAutoDateString
	verified?: boolean
}

// Response types include system fields and match responses from the PocketBase API
export type AuthoriginsResponse<Texpand = unknown> = Required<AuthoriginsRecord> & BaseSystemFields<Texpand>
export type ExternalauthsResponse<Texpand = unknown> = Required<ExternalauthsRecord> & BaseSystemFields<Texpand>
export type MfasResponse<Texpand = unknown> = Required<MfasRecord> & BaseSystemFields<Texpand>
export type OtpsResponse<Texpand = unknown> = Required<OtpsRecord> & BaseSystemFields<Texpand>
export type SuperusersResponse<Texpand = unknown> = Required<SuperusersRecord> & AuthSystemFields<Texpand>
export type BudgetItemsResponse<Texpand = unknown> = Required<BudgetItemsRecord> & BaseSystemFields<Texpand>
export type BudgetsResponse<Texpand = unknown> = Required<BudgetsRecord> & BaseSystemFields<Texpand>
export type ObligationsResponse<Texpand = unknown> = Required<ObligationsRecord> & BaseSystemFields<Texpand>
export type PaymentsResponse<Texpand = unknown> = Required<PaymentsRecord> & BaseSystemFields<Texpand>
export type PhasesResponse<Texpand = unknown> = Required<PhasesRecord> & BaseSystemFields<Texpand>
export type ProjectLogsResponse<Texpand = unknown> = Required<ProjectLogsRecord> & BaseSystemFields<Texpand>
export type ProjectsResponse<Texpand = unknown> = Required<ProjectsRecord> & BaseSystemFields<Texpand>
export type TransfersResponse<Texpand = unknown> = Required<TransfersRecord> & BaseSystemFields<Texpand>
export type UsersResponse<Texpand = unknown> = Required<UsersRecord> & AuthSystemFields<Texpand>

// Types containing all Records and Responses, useful for creating typing helper functions

export type CollectionRecords = {
	_authOrigins: AuthoriginsRecord
	_externalAuths: ExternalauthsRecord
	_mfas: MfasRecord
	_otps: OtpsRecord
	_superusers: SuperusersRecord
	budget_items: BudgetItemsRecord
	budgets: BudgetsRecord
	obligations: ObligationsRecord
	payments: PaymentsRecord
	phases: PhasesRecord
	project_logs: ProjectLogsRecord
	projects: ProjectsRecord
	transfers: TransfersRecord
	users: UsersRecord
}

export type CollectionResponses = {
	_authOrigins: AuthoriginsResponse
	_externalAuths: ExternalauthsResponse
	_mfas: MfasResponse
	_otps: OtpsResponse
	_superusers: SuperusersResponse
	budget_items: BudgetItemsResponse
	budgets: BudgetsResponse
	obligations: ObligationsResponse
	payments: PaymentsResponse
	phases: PhasesResponse
	project_logs: ProjectLogsResponse
	projects: ProjectsResponse
	transfers: TransfersResponse
	users: UsersResponse
}

// Utility types for create/update operations

type ProcessCreateAndUpdateFields<T> = Omit<{
	// Omit AutoDate fields
	[K in keyof T as Extract<T[K], IsoAutoDateString> extends never ? K : never]: 
		// Convert FileNameString to File
		T[K] extends infer U ? 
			U extends (FileNameString | FileNameString[]) ? 
				U extends any[] ? File[] : File 
			: U
		: never
}, 'id'>

// Create type for Auth collections
export type CreateAuth<T> = {
	id?: RecordIdString
	email: string
	emailVisibility?: boolean
	password: string
	passwordConfirm: string
	verified?: boolean
} & ProcessCreateAndUpdateFields<T>

// Create type for Base collections
export type CreateBase<T> = {
	id?: RecordIdString
} & ProcessCreateAndUpdateFields<T>

// Update type for Auth collections
export type UpdateAuth<T> = Partial<
	Omit<ProcessCreateAndUpdateFields<T>, keyof AuthSystemFields>
> & {
	email?: string
	emailVisibility?: boolean
	oldPassword?: string
	password?: string
	passwordConfirm?: string
	verified?: boolean
}

// Update type for Base collections
export type UpdateBase<T> = Partial<
	Omit<ProcessCreateAndUpdateFields<T>, keyof BaseSystemFields>
>

// Get the correct create type for any collection
export type Create<T extends keyof CollectionResponses> =
	CollectionResponses[T] extends AuthSystemFields
		? CreateAuth<CollectionRecords[T]>
		: CreateBase<CollectionRecords[T]>

// Get the correct update type for any collection
export type Update<T extends keyof CollectionResponses> =
	CollectionResponses[T] extends AuthSystemFields
		? UpdateAuth<CollectionRecords[T]>
		: UpdateBase<CollectionRecords[T]>

// Type for usage with type asserted PocketBase instance
// https://github.com/pocketbase/js-sdk#specify-typescript-definitions

export type TypedPocketBase = {
	collection<T extends keyof CollectionResponses>(
		idOrName: T
	): RecordService<CollectionResponses[T]>
} & PocketBase
