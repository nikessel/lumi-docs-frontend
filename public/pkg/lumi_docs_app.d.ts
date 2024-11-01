/* tslint:disable */
/* eslint-disable */
/**
*/
export function hydrate(): void;
/**
* @param {EchoInput} input
* @returns {Promise<EchoResponse>}
*/
export function echo(input: EchoInput): Promise<EchoResponse>;
/**
* @returns {Promise<GetPublicAuth0ConfigResponse>}
*/
export function get_public_auth0_config(): Promise<GetPublicAuth0ConfigResponse>;
/**
* @param {ExchangeCodeForIdentityInput} input
* @returns {Promise<ExchangeCodeForIdentityResponse>}
*/
export function exchange_code_for_identity(input: ExchangeCodeForIdentityInput): Promise<ExchangeCodeForIdentityResponse>;
/**
* @param {TokenToClaimsInput} input
* @returns {Promise<TokenToClaimsResponse>}
*/
export function token_to_claims(input: TokenToClaimsInput): Promise<TokenToClaimsResponse>;
/**
* @returns {Promise<AppVersionResponse>}
*/
export function app_version(): Promise<AppVersionResponse>;
/**
* @param {GetFileDataInput} input
* @returns {Promise<GetFileDataResponse>}
*/
export function get_file_data(input: GetFileDataInput): Promise<GetFileDataResponse>;
/**
* @param {UploadFileChunkInput} input
* @returns {Promise<UploadFileChunkResponse>}
*/
export function upload_file_chunk(input: UploadFileChunkInput): Promise<UploadFileChunkResponse>;
/**
* @returns {Promise<GetUserResponse>}
*/
export function get_user(): Promise<GetUserResponse>;
declare namespace StorageKey {
    export type id_token = "id_token";
    export type access_token = "access_token";
}

export type StorageKey = "id_token" | "access_token";

export interface EchoInput {
    input: string;
}

export interface EchoOutput {
    output: string;
}

export interface EchoResponse {
    output: EchoOutput | undefined;
    error: ClientSideError | undefined;
}

export interface GetPublicAuth0ConfigOutput {
    output: Auth0ConfigPublic;
}

export interface GetPublicAuth0ConfigResponse {
    output: GetPublicAuth0ConfigOutput | undefined;
    error: ClientSideError | undefined;
}

export interface ExchangeCodeForIdentityInput {
    code: string;
}

export interface ExchangeCodeForIdentityOutput {
    output: AuthIdentity;
}

export interface ExchangeCodeForIdentityResponse {
    output: ExchangeCodeForIdentityOutput | undefined;
    error: ClientSideError | undefined;
}

export interface TokenToClaimsInput {
    token: string;
}

export interface TokenToClaimsOutput {
    output: Claims;
}

export interface TokenToClaimsResponse {
    output: TokenToClaimsOutput | undefined;
    error: ClientSideError | undefined;
}

export interface AppVersionOutput {
    output: string;
}

export interface AppVersionResponse {
    output: AppVersionOutput | undefined;
    error: ClientSideError | undefined;
}

export interface GetFileDataInput {
    input: IdType;
}

export interface GetFileDataOutput {
    output: ArcBytes;
}

export interface GetFileDataResponse {
    output: GetFileDataOutput | undefined;
    error: ClientSideError | undefined;
}

export interface UploadFileChunkInput {
    file_id: IdType;
    chunk: FileChunk;
}

export interface UploadFileChunkOutput {
    output: undefined;
}

export interface UploadFileChunkResponse {
    output: UploadFileChunkOutput | undefined;
    error: ClientSideError | undefined;
}

export interface GetUserOutput {
    output: User;
}

export interface GetUserResponse {
    output: GetUserOutput | undefined;
    error: ClientSideError | undefined;
}

declare namespace ErrorKind {
    export type Validation = "Validation";
    export type NotFound = "NotFound";
    export type AlreadyExists = "AlreadyExists";
    export type Unauthorized = "Unauthorized";
    export type Timeout = "Timeout";
    export type Deserialization = "Deserialization";
    export type Serialization = "Serialization";
    export type Server = "Server";
}

export type ErrorKind = "Validation" | "NotFound" | "AlreadyExists" | "Unauthorized" | "Timeout" | "Deserialization" | "Serialization" | "Server";

export interface ClientSideError {
    kind: ErrorKind;
    message: string;
}

export interface UserConfig {
    user: UserBaseConfig;
    admin: AdminConfig;
}

export interface UserBaseConfig {}

export interface AdminConfig {
    embed_config: EmbedConfig;
    llm_config: LlmConfig;
}

export interface ChunkId {
    parent_id: string;
    index: number;
}

export type VersionedIdType = [string, number];

export type IdType = string;

export interface EmbedConfig {
    model: EmbedModel;
    regulation_vector_search_limit: number;
    user_documentation_vector_search_limit: number;
    tokens_per_chunk: number;
    token_overlap: number;
}

export interface User {
    id: IdType;
    first_name: string;
    last_name: string;
    email: Email;
    job_title: string | undefined;
    company: string | undefined;
    config?: UserConfig;
}

export interface LlmConfig {
    model: LlmModel;
    temperature: number | undefined;
}

export interface Claims {
    nickname: string;
    given_name?: string | undefined;
    family_name?: string | undefined;
    name: string;
    picture: string;
    updated_at: string;
    email: string;
    email_verified: boolean;
    id: IdType;
    iss: string;
    aud: string;
    iat: number;
    exp: number;
    sub: string;
    sid: string;
}

export interface UserSignupForm {
    first_name: string;
    last_name: string;
    job_title: string | undefined;
    company: string | undefined;
    config: UserConfig;
}

export type Email = string;

export interface FileChunk {
    id: ChunkId;
    data: ArcBytes;
}

export interface Auth0ConfigPublic {
    domain: ArcStr;
    client_id: ArcStr;
    login_redirect_uri: ArcStr;
    logout_redirect_uri: ArcStr;
}

export interface AuthIdentity {
    id_token: ArcStr;
    access_token: ArcStr;
    refresh_token: ArcStr;
}

export type ArcStr = string;

export type ArcBytes = Uint8Array;

export interface ReportFilterConfig {
    categories_to_include: Id[] | undefined;
    requirements_to_include: Id[] | undefined;
}

/**
*/
export class IntoUnderlyingByteSource {
  free(): void;
/**
* @param {ReadableByteStreamController} controller
*/
  start(controller: ReadableByteStreamController): void;
/**
* @param {ReadableByteStreamController} controller
* @returns {Promise<any>}
*/
  pull(controller: ReadableByteStreamController): Promise<any>;
/**
*/
  cancel(): void;
/**
*/
  readonly autoAllocateChunkSize: number;
/**
*/
  readonly type: string;
}
/**
*/
export class IntoUnderlyingSink {
  free(): void;
/**
* @param {any} chunk
* @returns {Promise<any>}
*/
  write(chunk: any): Promise<any>;
/**
* @returns {Promise<any>}
*/
  close(): Promise<any>;
/**
* @param {any} reason
* @returns {Promise<any>}
*/
  abort(reason: any): Promise<any>;
}
/**
*/
export class IntoUnderlyingSource {
  free(): void;
/**
* @param {ReadableStreamDefaultController} controller
* @returns {Promise<any>}
*/
  pull(controller: ReadableStreamDefaultController): Promise<any>;
/**
*/
  cancel(): void;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly hydrate: () => void;
  readonly echo: (a: number) => number;
  readonly get_public_auth0_config: () => number;
  readonly exchange_code_for_identity: (a: number) => number;
  readonly token_to_claims: (a: number) => number;
  readonly app_version: () => number;
  readonly get_file_data: (a: number) => number;
  readonly upload_file_chunk: (a: number) => number;
  readonly get_user: () => number;
  readonly __wbg_intounderlyingsink_free: (a: number, b: number) => void;
  readonly intounderlyingsink_write: (a: number, b: number) => number;
  readonly intounderlyingsink_close: (a: number) => number;
  readonly intounderlyingsink_abort: (a: number, b: number) => number;
  readonly __wbg_intounderlyingsource_free: (a: number, b: number) => void;
  readonly intounderlyingsource_pull: (a: number, b: number) => number;
  readonly intounderlyingsource_cancel: (a: number) => void;
  readonly __wbg_intounderlyingbytesource_free: (a: number, b: number) => void;
  readonly intounderlyingbytesource_type: (a: number, b: number) => void;
  readonly intounderlyingbytesource_autoAllocateChunkSize: (a: number) => number;
  readonly intounderlyingbytesource_start: (a: number, b: number) => void;
  readonly intounderlyingbytesource_pull: (a: number, b: number) => number;
  readonly intounderlyingbytesource_cancel: (a: number) => void;
  readonly __wbindgen_export_0: (a: number, b: number) => number;
  readonly __wbindgen_export_1: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_export_2: WebAssembly.Table;
  readonly __wbindgen_export_3: (a: number, b: number, c: number) => void;
  readonly __wbindgen_export_4: (a: number, b: number, c: number) => void;
  readonly __wbindgen_export_5: (a: number) => void;
  readonly __wbindgen_export_6: (a: number, b: number, c: number, d: number) => void;
  readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
*
* @returns {InitOutput}
*/
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
