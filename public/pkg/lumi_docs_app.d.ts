/* tslint:disable */
/* eslint-disable */
/**
 * @param {GetFileDataInput} input
 * @returns {Promise<GetFileDataResponse>}
 */
export function get_file_data(input: GetFileDataInput): Promise<GetFileDataResponse>;
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
 * @param {UploadFileChunkInput} input
 * @returns {Promise<UploadFileChunkResponse>}
 */
export function upload_file_chunk(input: UploadFileChunkInput): Promise<UploadFileChunkResponse>;
/**
 * @returns {Promise<GetUserResponse>}
 */
export function get_user(): Promise<GetUserResponse>;
/**
 * @param {GetReportInput} input
 * @returns {Promise<GetReportResponse>}
 */
export function get_report(input: GetReportInput): Promise<GetReportResponse>;
/**
 * @returns {Promise<GetReportsResponse>}
 */
export function get_reports(): Promise<GetReportsResponse>;
/**
 * @param {GetFileInput} input
 * @returns {Promise<GetFileResponse>}
 */
export function get_file(input: GetFileInput): Promise<GetFileResponse>;
/**
 * @param {GetRequirementInput} input
 * @returns {Promise<GetRequirementResponse>}
 */
export function get_requirement(input: GetRequirementInput): Promise<GetRequirementResponse>;
/**
 * @returns {Promise<GetCategoriesResponse>}
 */
export function get_categories(): Promise<GetCategoriesResponse>;
/**
 * @returns {Promise<GetFilesResponse>}
 */
export function get_files(): Promise<GetFilesResponse>;
/**
 * @returns {Promise<GetRequirementsResponse>}
 */
export function get_requirements(): Promise<GetRequirementsResponse>;
/**
 * @param {GetSubRequirementsInput} input
 * @returns {Promise<GetSubRequirementsResponse>}
 */
export function get_sub_requirements(input: GetSubRequirementsInput): Promise<GetSubRequirementsResponse>;
/**
 * @param {CreateUserInput} input
 * @returns {Promise<CreateUserResponse>}
 */
export function create_user(input: CreateUserInput): Promise<CreateUserResponse>;
/**
 * @param {CreateReportInput} input
 * @returns {Promise<CreateReportResponse>}
 */
export function create_report(input: CreateReportInput): Promise<CreateReportResponse>;
/**
 * @param {CreateFileInput} input
 * @returns {Promise<CreateFileResponse>}
 */
export function create_file(input: CreateFileInput): Promise<CreateFileResponse>;
/**
 * @returns {Promise<UserExistsResponse>}
 */
export function user_exists(): Promise<UserExistsResponse>;
/**
 * @returns {Promise<IsAdminResponse>}
 */
export function is_admin(): Promise<IsAdminResponse>;
export function hydrate(): void;
/**
 * @param {Function} callback
 */
export function set_websocket_event_callback(callback: Function): void;
export interface GetFileDataInput {
    input: IdType;
}

export interface GetFileDataOutput {
    output: Uint8Array;
}

export interface GetFileDataResponse {
    output: GetFileDataOutput | undefined;
    error: ClientSideError | undefined;
}

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

export interface GetReportInput {
    input: IdType;
}

export interface GetReportOutput {
    output: Report;
}

export interface GetReportResponse {
    output: GetReportOutput | undefined;
    error: ClientSideError | undefined;
}

export interface GetReportsOutput {
    output: Report[];
}

export interface GetReportsResponse {
    output: GetReportsOutput | undefined;
    error: ClientSideError | undefined;
}

export interface GetFileInput {
    input: IdType;
}

export interface GetFileOutput {
    output: File;
}

export interface GetFileResponse {
    output: GetFileOutput | undefined;
    error: ClientSideError | undefined;
}

export interface GetRequirementInput {
    input: IdType;
}

export interface GetRequirementOutput {
    output: Requirement;
}

export interface GetRequirementResponse {
    output: GetRequirementOutput | undefined;
    error: ClientSideError | undefined;
}

export interface GetCategoriesOutput {
    output: Section[];
}

export interface GetCategoriesResponse {
    output: GetCategoriesOutput | undefined;
    error: ClientSideError | undefined;
}

export interface GetFilesOutput {
    output: File[];
}

export interface GetFilesResponse {
    output: GetFilesOutput | undefined;
    error: ClientSideError | undefined;
}

export interface GetRequirementsOutput {
    output: Requirement[];
}

export interface GetRequirementsResponse {
    output: GetRequirementsOutput | undefined;
    error: ClientSideError | undefined;
}

export interface GetSubRequirementsInput {
    input: IdType;
}

export interface GetSubRequirementsOutput {
    output: Requirement[];
}

export interface GetSubRequirementsResponse {
    output: GetSubRequirementsOutput | undefined;
    error: ClientSideError | undefined;
}

export interface CreateUserInput {
    input: UserSignupForm;
}

export interface CreateUserOutput {
    output: undefined;
}

export interface CreateUserResponse {
    output: CreateUserOutput | undefined;
    error: ClientSideError | undefined;
}

export interface CreateReportInput {
    input: ReportFilterConfig;
}

export interface CreateReportOutput {
    output: IdType;
}

export interface CreateReportResponse {
    output: CreateReportOutput | undefined;
    error: ClientSideError | undefined;
}

export interface CreateFileInput {
    input: File;
}

export interface CreateFileOutput {
    output: undefined;
}

export interface CreateFileResponse {
    output: CreateFileOutput | undefined;
    error: ClientSideError | undefined;
}

export interface UserExistsOutput {
    output: boolean;
}

export interface UserExistsResponse {
    output: UserExistsOutput | undefined;
    error: ClientSideError | undefined;
}

export interface IsAdminOutput {
    output: boolean;
}

export interface IsAdminResponse {
    output: IsAdminOutput | undefined;
    error: ClientSideError | undefined;
}

declare namespace ErrorKind {
    export type Validation = "Validation";
    export type NotFound = "NotFound";
    export type AlreadyExists = "AlreadyExists";
    export type EmailNotVerified = "EmailNotVerified";
    export type Unauthorized = "Unauthorized";
    export type Timeout = "Timeout";
    export type Deserialization = "Deserialization";
    export type Serialization = "Serialization";
    export type Server = "Server";
}

export type ErrorKind = "Validation" | "NotFound" | "AlreadyExists" | "EmailNotVerified" | "Unauthorized" | "Timeout" | "Deserialization" | "Serialization" | "Server";

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
    config: UserBaseConfig;
}

export type Email = string;

declare namespace FileExtension {
    export type pdf = "pdf";
    export type txt = "txt";
    export type md = "md";
    export type zip = "zip";
}

export type FileExtension = "pdf" | "txt" | "md" | "zip";

declare namespace RegulatoryFramework {
    export type mdr = "mdr";
    export type iso13485 = "iso13485";
}

export type RegulatoryFramework = "mdr" | "iso13485";

declare namespace ReportStatus {
    export type processing = "processing";
    export type ready = "ready";
    export type partially_failed = "partially_failed";
}

export type ReportStatus = "processing" | "ready" | "partially_failed";

export type FileStatus = "uploading" | "processing" | "ready" | { upload_failed: ArcStr } | { processing_failed: ArcStr };

export interface FileChunk {
    id: ChunkId;
    data: ArcBytes;
}

export type Percentage = number;

export type ComplianceRating = number;

declare namespace TaskStatus {
    export type open = "open";
    export type completed = "completed";
    export type ignored = "ignored";
}

export type TaskStatus = "open" | "completed" | "ignored";

declare namespace SuggestionKind {
    export type edit_paragraph = "edit_paragraph";
    export type add_paragraph = "add_paragraph";
    export type remove_paragraph = "remove_paragraph";
    export type new_document = "new_document";
}

export type SuggestionKind = "edit_paragraph" | "add_paragraph" | "remove_paragraph" | "new_document";

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

export interface FullFile {
    meta: File;
    data: ArcBytes;
}

export interface EmbedConfig {
    model: EmbedModel;
    regulation_vector_search_limit: number;
    user_documentation_vector_search_limit: number;
    tokens_per_chunk: number;
    token_overlap: number;
    vector_store_id: string | undefined;
}

export interface Task {
    id: IdType;
    status?: TaskStatus;
    title: string;
    description: ArcStr;
    task: ArcStr;
    suggestion: Suggestion | undefined;
    associated_document: string | undefined;
}

export interface Requirement {
    id: IdType;
    name: string;
    description: ArcStr;
    reference: string | undefined;
}

export interface Section {
    id: IdType;
    name: string;
    description: ArcStr;
}

export interface File {
    id: IdType;
    multipart_upload_id: string | undefined;
    multipart_upload_part_ids: string[] | undefined;
    path: string;
    title: string;
    extension: FileExtension;
    size: number;
    total_chunks: number;
    uploaded: boolean;
    created_date: DateTime<Utc>;
    status: FileStatus;
}

export interface Report {
    id: IdType;
    status: ReportStatus;
    regulatory_framework: RegulatoryFramework;
    created_date: DateTime<Utc>;
    title: string;
    abstract_text: string;
    compliance_rating: ComplianceRating;
    section_assessments: SectionAssessment[];
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

export interface ChunkId {
    parent_id: string;
    index: number;
}

export type IdType = string;

export interface ReportFilterConfig {
    categories_to_include: VersionedIdType[] | undefined;
    requirements_to_include: VersionedIdType[] | undefined;
}

export interface SectionAssessment {
    section_id?: IdType | undefined;
    abstract_text: ArcStr;
    compliance_rating: ComplianceRating;
    requirement_assements: RequirementAssessment[];
}

export interface ReportAbstractAndTitle {
    abstract_text: ArcStr;
    title: ArcStr;
}

export interface RequirementAssessment {
    /**
     * ID reference to the requirement being assessed
     */
    requirement_id?: IdType | undefined;
    /**
     * The compliance rating indicating the level of conformity with the requirement
     */
    compliance_rating: ComplianceRating;
    /**
     * Comprehensive explanation of the compliance assessment, including methodology and findings
     */
    details: ArcStr;
    /**
     * Brief overview of the compliance status and key findings
     */
    summary: ArcStr;
    /**
     * List of identified non-conformities, gaps, or issues that need to be addressed
     */
    findings: ArcStr[];
    /**
     * Set of document identifiers that were analyzed during the assessment
     */
    sources: string[];
    /**
     * Set of specific citations and references supporting the assessment findings
     */
    references: Citation[];
}

export interface Suggestion {
    kind: SuggestionKind;
    description: ArcStr;
    content: ArcStr;
}

export type Event = { Created: CreateEvent } | { Deleted: DeleteEvent } | { Updated: UpdateEvent } | { Progress: ProgressEvent } | { Error: string } | "ConnectionAuthorized";

export interface LlmConfig {
    model: LlmModel;
    temperature: number | undefined;
}

export type ProgressEvent = { Report: [IdType, number] };

export type UpdateEvent = { File: IdType } | { User: IdType } | { Requirement: IdType };

export type DeleteEvent = { File: IdType };

export type CreateEvent = { File: IdType } | { Report: IdType };

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
  cancel(): void;
  readonly autoAllocateChunkSize: number;
  readonly type: any;
}
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
export class IntoUnderlyingSource {
  free(): void;
  /**
   * @param {ReadableStreamDefaultController} controller
   * @returns {Promise<any>}
   */
  pull(controller: ReadableStreamDefaultController): Promise<any>;
  cancel(): void;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly get_file_data: (a: number) => number;
  readonly echo: (a: number) => number;
  readonly get_public_auth0_config: () => number;
  readonly exchange_code_for_identity: (a: number) => number;
  readonly token_to_claims: (a: number) => number;
  readonly app_version: () => number;
  readonly upload_file_chunk: (a: number) => number;
  readonly get_user: () => number;
  readonly get_report: (a: number) => number;
  readonly get_reports: () => number;
  readonly get_file: (a: number) => number;
  readonly get_requirement: (a: number) => number;
  readonly get_categories: () => number;
  readonly get_files: () => number;
  readonly get_requirements: () => number;
  readonly get_sub_requirements: (a: number) => number;
  readonly create_user: (a: number) => number;
  readonly create_report: (a: number) => number;
  readonly create_file: (a: number) => number;
  readonly user_exists: () => number;
  readonly is_admin: () => number;
  readonly hydrate: () => void;
  readonly set_websocket_event_callback: (a: number) => void;
  readonly __wbg_intounderlyingsink_free: (a: number, b: number) => void;
  readonly intounderlyingsink_write: (a: number, b: number) => number;
  readonly intounderlyingsink_close: (a: number) => number;
  readonly intounderlyingsink_abort: (a: number, b: number) => number;
  readonly __wbg_intounderlyingbytesource_free: (a: number, b: number) => void;
  readonly intounderlyingbytesource_type: (a: number) => number;
  readonly intounderlyingbytesource_autoAllocateChunkSize: (a: number) => number;
  readonly intounderlyingbytesource_start: (a: number, b: number) => void;
  readonly intounderlyingbytesource_pull: (a: number, b: number) => number;
  readonly intounderlyingbytesource_cancel: (a: number) => void;
  readonly __wbg_intounderlyingsource_free: (a: number, b: number) => void;
  readonly intounderlyingsource_pull: (a: number, b: number) => number;
  readonly intounderlyingsource_cancel: (a: number) => void;
  readonly __wbindgen_export_0: (a: number, b: number) => number;
  readonly __wbindgen_export_1: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_export_2: WebAssembly.Table;
  readonly __wbindgen_export_3: (a: number, b: number) => void;
  readonly __wbindgen_export_4: (a: number, b: number, c: number) => void;
  readonly __wbindgen_export_5: (a: number, b: number) => void;
  readonly __wbindgen_export_6: (a: number, b: number, c: number) => void;
  readonly __wbindgen_export_7: (a: number, b: number, c: number) => void;
  readonly __wbindgen_export_8: (a: number) => void;
  readonly __wbindgen_export_9: (a: number, b: number, c: number, d: number) => void;
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
