/* tslint:disable */
/* eslint-disable */
export function hydrate(): void;
export function echo(input: EchoInput): Promise<EchoResponse>;
export function get_public_auth0_config(): Promise<GetPublicAuth0ConfigResponse>;
export function exchange_code_for_identity(input: ExchangeCodeForIdentityInput): Promise<ExchangeCodeForIdentityResponse>;
export function token_to_claims(input: TokenToClaimsInput): Promise<TokenToClaimsResponse>;
export function app_version(): Promise<AppVersionResponse>;
export function upload_file_chunk(input: UploadFileChunkInput): Promise<UploadFileChunkResponse>;
export function get_user(): Promise<GetUserResponse>;
export function get_task(input: GetTaskInput): Promise<GetTaskResponse>;
export function get_report(input: GetReportInput): Promise<GetReportResponse>;
export function get_all_reports(): Promise<GetAllReportsResponse>;
export function get_file(input: GetFileInput): Promise<GetFileResponse>;
export function get_requirement(input: GetRequirementInput): Promise<GetRequirementResponse>;
export function get_requirement_group(input: GetRequirementGroupInput): Promise<GetRequirementGroupResponse>;
export function get_sections(input: GetSectionsInput): Promise<GetSectionsResponse>;
export function get_tasks_by_report(input: GetTasksByReportInput): Promise<GetTasksByReportResponse>;
export function get_tasks_by_report_and_requirement(input: GetTasksByReportAndRequirementInput): Promise<GetTasksByReportAndRequirementResponse>;
export function get_tasks_by_document(input: GetTasksByDocumentInput): Promise<GetTasksByDocumentResponse>;
export function get_requirement_groups_by_section(input: GetRequirementGroupsBySectionInput): Promise<GetRequirementGroupsBySectionResponse>;
export function get_child_requirement_groups(input: GetChildRequirementGroupsInput): Promise<GetChildRequirementGroupsResponse>;
export function get_requirements_by_group(input: GetRequirementsByGroupInput): Promise<GetRequirementsByGroupResponse>;
export function get_all_sections(): Promise<GetAllSectionsResponse>;
export function get_all_files(): Promise<GetAllFilesResponse>;
export function get_all_requirements(): Promise<GetAllRequirementsResponse>;
export function get_all_requirement_groups(): Promise<GetAllRequirementGroupsResponse>;
export function create_user(input: CreateUserInput): Promise<CreateUserResponse>;
export function create_report(input: CreateReportInput): Promise<CreateReportResponse>;
export function create_file(input: CreateFileInput): Promise<CreateFileResponse>;
export function update_user(input: UpdateUserInput): Promise<UpdateUserResponse>;
export function update_task(input: UpdateTaskInput): Promise<UpdateTaskResponse>;
export function user_exists(): Promise<UserExistsResponse>;
export function is_admin(): Promise<IsAdminResponse>;
export function admin_upload_report(input: AdminUploadReportInput): Promise<AdminUploadReportResponse>;
export function new_file(input: NewFileInput): NewFileResponse;
export function admin_get_threads_by_report(input: AdminGetThreadsByReportInput): Promise<AdminGetThreadsByReportResponse>;
export function admin_get_threads_by_section(input: AdminGetThreadsBySectionInput): Promise<AdminGetThreadsBySectionResponse>;
export function admin_get_threads_by_requirement_group(input: AdminGetThreadsByRequirementGroupInput): Promise<AdminGetThreadsByRequirementGroupResponse>;
export function admin_get_threads_by_requirement(input: AdminGetThreadsByRequirementInput): Promise<AdminGetThreadsByRequirementResponse>;
export function get_file_data(input: GetFileDataInput): Promise<GetFileDataResponse>;
export function set_websocket_event_callback(callback: Function): void;
/**
 * The `ReadableStreamType` enum.
 *
 * *This API requires the following crate features to be activated: `ReadableStreamType`*
 */
type ReadableStreamType = "bytes";
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

export interface GetTaskInput {
    input: IdType;
}

export interface GetTaskOutput {
    output: Task;
}

export interface GetTaskResponse {
    output: GetTaskOutput | undefined;
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

export interface GetAllReportsOutput {
    output: Report[];
}

export interface GetAllReportsResponse {
    output: GetAllReportsOutput | undefined;
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

export interface GetRequirementGroupInput {
    input: IdType;
}

export interface GetRequirementGroupOutput {
    output: RequirementGroup;
}

export interface GetRequirementGroupResponse {
    output: GetRequirementGroupOutput | undefined;
    error: ClientSideError | undefined;
}

export interface GetSectionsInput {
    input: IdType[];
}

export interface GetSectionsOutput {
    output: Section[];
}

export interface GetSectionsResponse {
    output: GetSectionsOutput | undefined;
    error: ClientSideError | undefined;
}

export interface GetTasksByReportInput {
    input: IdType;
}

export interface GetTasksByReportOutput {
    output: Task[];
}

export interface GetTasksByReportResponse {
    output: GetTasksByReportOutput | undefined;
    error: ClientSideError | undefined;
}

export interface GetTasksByReportAndRequirementInput {
    report_id: IdType;
    requirement_id: IdType;
}

export interface GetTasksByReportAndRequirementOutput {
    output: Task[];
}

export interface GetTasksByReportAndRequirementResponse {
    output: GetTasksByReportAndRequirementOutput | undefined;
    error: ClientSideError | undefined;
}

export interface GetTasksByDocumentInput {
    report_id: IdType;
    document: string;
}

export interface GetTasksByDocumentOutput {
    output: Task[];
}

export interface GetTasksByDocumentResponse {
    output: GetTasksByDocumentOutput | undefined;
    error: ClientSideError | undefined;
}

export interface GetRequirementGroupsBySectionInput {
    input: IdType;
}

export interface GetRequirementGroupsBySectionOutput {
    output: RequirementGroup[];
}

export interface GetRequirementGroupsBySectionResponse {
    output: GetRequirementGroupsBySectionOutput | undefined;
    error: ClientSideError | undefined;
}

export interface GetChildRequirementGroupsInput {
    input: IdType;
}

export interface GetChildRequirementGroupsOutput {
    output: RequirementGroup[];
}

export interface GetChildRequirementGroupsResponse {
    output: GetChildRequirementGroupsOutput | undefined;
    error: ClientSideError | undefined;
}

export interface GetRequirementsByGroupInput {
    input: IdType;
}

export interface GetRequirementsByGroupOutput {
    output: Requirement[];
}

export interface GetRequirementsByGroupResponse {
    output: GetRequirementsByGroupOutput | undefined;
    error: ClientSideError | undefined;
}

export interface GetAllSectionsOutput {
    output: Section[];
}

export interface GetAllSectionsResponse {
    output: GetAllSectionsOutput | undefined;
    error: ClientSideError | undefined;
}

export interface GetAllFilesOutput {
    output: File[];
}

export interface GetAllFilesResponse {
    output: GetAllFilesOutput | undefined;
    error: ClientSideError | undefined;
}

export interface GetAllRequirementsOutput {
    output: Requirement[];
}

export interface GetAllRequirementsResponse {
    output: GetAllRequirementsOutput | undefined;
    error: ClientSideError | undefined;
}

export interface GetAllRequirementGroupsOutput {
    output: RequirementGroup[];
}

export interface GetAllRequirementGroupsResponse {
    output: GetAllRequirementGroupsOutput | undefined;
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

export interface UpdateUserInput {
    input: User;
}

export interface UpdateUserOutput {
    output: undefined;
}

export interface UpdateUserResponse {
    output: UpdateUserOutput | undefined;
    error: ClientSideError | undefined;
}

export interface UpdateTaskInput {
    input: Task;
}

export interface UpdateTaskOutput {
    output: undefined;
}

export interface UpdateTaskResponse {
    output: UpdateTaskOutput | undefined;
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

export interface AdminUploadReportInput {
    input: Report;
}

export interface AdminUploadReportOutput {
    output: undefined;
}

export interface AdminUploadReportResponse {
    output: AdminUploadReportOutput | undefined;
    error: ClientSideError | undefined;
}

export interface NewFileInput {
    path: string;
    size: number;
}

export interface NewFileOutput {
    output: File;
}

export interface NewFileResponse {
    output: NewFileOutput | undefined;
    error: ClientSideError | undefined;
}

export interface AdminGetThreadsByReportInput {
    input: IdType;
}

export interface AdminGetThreadsByReportOutput {
    output: Thread;
}

export interface AdminGetThreadsByReportResponse {
    output: AdminGetThreadsByReportOutput | undefined;
    error: ClientSideError | undefined;
}

export interface AdminGetThreadsBySectionInput {
    report_id: IdType;
    section_id: IdType;
}

export interface AdminGetThreadsBySectionOutput {
    output: Thread;
}

export interface AdminGetThreadsBySectionResponse {
    output: AdminGetThreadsBySectionOutput | undefined;
    error: ClientSideError | undefined;
}

export interface AdminGetThreadsByRequirementGroupInput {
    report_id: IdType;
    group_id: IdType;
}

export interface AdminGetThreadsByRequirementGroupOutput {
    output: Thread;
}

export interface AdminGetThreadsByRequirementGroupResponse {
    output: AdminGetThreadsByRequirementGroupOutput | undefined;
    error: ClientSideError | undefined;
}

export interface AdminGetThreadsByRequirementInput {
    report_id: IdType;
    requirement_id: IdType;
}

export interface AdminGetThreadsByRequirementOutput {
    output: Thread;
}

export interface AdminGetThreadsByRequirementResponse {
    output: AdminGetThreadsByRequirementOutput | undefined;
    error: ClientSideError | undefined;
}

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

export interface ReportFilterConfig {
    sections_to_include: IdType[] | undefined;
    requirements_to_include: IdType[] | undefined;
    requirement_groups_to_include: IdType[] | undefined;
}

export type Event = { Created: CreateEvent } | { Deleted: DeleteEvent } | { Updated: UpdateEvent } | { Progress: ProgressEvent } | { Error: string } | "ConnectionAuthorized";

/**
 * Comprehensive evaluation of a requirement\'s implementation status and supporting evidence
 *
 * A `RequirementAssessment` captures the detailed analysis of how well a specific requirement
 * is met, including compliance level, applicability, assessment confidence, and supporting
 * evidence. It provides structured documentation of findings, gaps, and necessary improvements
 * based on objective evidence and expert analysis.
 */
export interface RequirementAssessment {
    /**
     * Numerical rating (0-100) indicating implementation completeness and quality
     *
     * Examples:
     * - 95: Battery compartment design (`GlucoCheck` Basic) - Exceeds requirements through multi-layered approach:
     *   mechanical polarity enforcement, clear markings, and electronic reverse polarity protection
     * - 75: Lead integrity monitoring (`NeuroStim` Pro) - Meets core requirements with basic impedance
     *   checking and automatic shutdown, but could be enhanced with predictive failure detection
     * - 45: Biocompatibility testing documentation - Major gaps in chronic toxicity studies
     *   and inadequate validation of drug-eluting coating stability
     */
    compliance_rating: ComplianceRating;
    /**
     * Rating (0-100) indicating how relevant the requirement is to the device
     *
     * Examples:
     * - 100: Software validation for `GlucoCheck` Basic - Fully applicable as device contains
     *   firmware and mobile app requiring comprehensive validation
     * - 60: MRI compatibility for `GlucoCheck` Basic - Partially applicable only to
     *   electromagnetic interference aspects, as device is not used during MRI
     * - 0: Sterilization validation for `GlucoCheck` Basic - Not applicable as device is non-sterile
     *   and does not contact broken skin
     */
    applicability_rating: ApplicabilityRating;
    /**
     * Rating (0-100) indicating assessment reliability based on evidence quality
     *
     * Examples:
     * - 90: Battery safety assessment - High confidence from clear requirements, comprehensive test
     *   reports, and consistent results across multiple validation studies
     * - 70: Software validation - Good confidence but some ambiguity in test coverage metrics
     *   and validation of edge cases
     * - 40: Coating stability - Limited confidence due to inconsistent test results and
     *   incomplete characterization data
     */
    confidence_rating: ConfidenceRating;
    /**
     * Detailed analysis and evaluation of requirement compliance
     *
     * Examples:
     *
     * Battery Safety (`GlucoCheck` Basic):
     * Assessment methodology utilized physical inspection of three device samples, review of design
     * documentation (DR-201, DR-202), and analysis of test reports (TR-150, TR-151). Testing
     * demonstrated successful implementation of battery safety features including mechanical polarity
     * enforcement and electronic reverse voltage protection. Design validation included drop testing
     * and attempted incorrect battery insertion by 30 test subjects. Risk analysis demonstrated
     * reduction of battery-related risks to acceptable levels through multiple redundant controls.
     * Implementation exceeds requirements through inclusion of additional safety features beyond
     * basic polarity protection. Minor opportunity for improvement identified in battery replacement
     * instructions clarity.
     *
     * Drug-Eluting Coating (`NeuroStim` Pro):
     * Assessment covered design controls, manufacturing process validation, and stability testing
     * for anti-inflammatory coating. Chemistry documentation shows incomplete characterization
     * of degradation products. While basic elution profile data exists, accelerated aging studies
     * lack sufficient timepoints. Process controls exist but validation of coating uniformity
     * shows significant variability. Multiple gaps identified in stability monitoring program.
     * Current implementation requires substantial enhancement to meet requirements.
     */
    details: string;
    /**
     * Objective summary of manufacturer-provided information relevant to the requirement
     *
     * Examples:
     *
     * Battery Safety (`GlucoCheck` Basic):
     * Device uses 2 AAA batteries housed in rear compartment. Battery holder includes mechanical
     * keying features preventing reverse insertion. PCB incorporates P-channel MOSFET for reverse
     * polarity protection. Battery compartment labeled with polarity indicators and pictorial
     * diagram. Replacement procedure detailed in user manual section 3.4. Battery life rated at
     * 2000 measurements under normal use. Low battery warning displays at 20% remaining capacity.
     * Design validation report DR-201 documents testing with 30 users attempting battery replacement.
     *
     * Drug-Eluting Coating (`NeuroStim` Pro):
     * Coating consists of dexamethasone acetate in polymer matrix at 100 µg/cm². Elution profile
     * shows 80% release over 6 months. Manufacturing process uses automated spray coating with
     * real-time thickness monitoring. Coating stability verified through 12-month real-time and
     * 6-month accelerated aging. Process validation included 3 consecutive batches of 30 units each.
     * Surface characterization performed via SEM and FTIR analysis.
     */
    objective_research_summary: string;
    /**
     * List of identified gaps requiring remediation
     *
     * Examples:
     *
     * Battery Safety (`GlucoCheck` Basic):
     * - Battery replacement instructions in user manual lack clear illustrations of correct orientation
     * - Warning label on battery door shows slight wear after repeated opening in durability testing
     *
     * Drug-Eluting Coating (`NeuroStim` Pro):
     * - Accelerated aging protocol lacks sufficient timepoints to establish complete degradation profile
     * - Process validation data shows coating thickness variation exceeding ±15% specification
     * - Stability program does not include testing of aged samples for biological activity
     * - Degradation product characterization limited to major components only
     * - Cleaning validation does not address impact on coating integrity
     */
    negative_findings: string[];
    /**
     * Set of all documents reviewed during assessment
     *
     * Examples:
     *
     * Battery Safety (`GlucoCheck` Basic):
     * - Design Requirements Specification (DR-100)
     * - Battery Subsystem Design Document (DR-201)
     * - Electronics Design Document (DR-202)
     * - Battery Safety Test Report (TR-150)
     * - User Manual (UM-101)
     * - Risk Analysis Report (RA-300)
     * - Design Validation Report (DVR-400)
     *
     * Drug-Eluting Coating (`NeuroStim` Pro):
     * - Coating Process Specification (PS-501)
     * - Design History File Section 4.2
     * - Process Validation Protocol (PVP-120)
     * - Stability Study Report (STB-300)
     * - Coating Characterization Report (CCR-401)
     * - Manufacturing Process Flow (MPF-200)
     * - Risk Management File Section 3.5
     */
    sources: string[];
    /**
     * Exact quotes from source documents supporting the assessment
     */
    quotes?: AssessmentQuote[];
}

export interface ChunkId {
    parent_id: string;
    index: number;
}

export type IdType = string;

/**
 * Measures documentation quality and implementation effectiveness.
 *
 * The compliance rating evaluates how well documentation and implementation meet
 * specified requirements, providing a standardized way to assess audit readiness
 * and documentation completeness.
 *
 * # Compliance Rating Scale (0-100)
 *
 * ## 95-100: Exceptional Implementation
 * - Documentation and implementation significantly exceed requirements
 * - Comprehensive evidence demonstrates thorough implementation
 * - Serves as industry best practice example
 *
 * ## 85-94: Advanced Implementation
 * - Documentation and implementation exceed basic requirements
 * - Strong evidence supports all implementation aspects
 * - Minor enhancement opportunities may exist
 *
 * ## 75-84: Solid Implementation
 * - Documentation meets all core requirements
 * - Implementation evidence is present but could be strengthened
 * - Some enhancement opportunities identified
 *
 * ## 65-74: Basic Implementation
 * - Documentation meets minimum requirements
 * - Implementation evidence needs enhancement
 * - Several areas identified for improvement
 *
 * ## 50-64: Partial Implementation
 * - Notable gaps in documentation/implementation
 * - Multiple areas require significant enhancement
 * - May not satisfy minimum requirements
 *
 * ## 35-49: Limited Implementation
 * - Significant documentation and implementation gaps
 * - Critical evidence missing
 * - Requires substantial improvement
 *
 * ## 20-34: Minimal Implementation
 * - Documentation severely lacking
 * - Implementation evidence largely absent
 * - Requires major rework
 *
 * ## 1-19: Initial Implementation
 * - Critical documentation missing
 * - Minimal implementation evidence
 * - Requires complete redevelopment
 *
 * ## 0: No Implementation
 * - No documentation exists
 * - No implementation evidence
 * - Requires complete development
 *
 * # Device-Specific Considerations
 * Requirements may be deemed not applicable based on device characteristics:
 * - Sterile vs. non-sterile
 * - Software vs. hardware
 * - Reusable vs. single-use
 * - Active vs. non-active
 * - Implantable vs. non-implantable
 * - Diagnostic vs. therapeutic
 * - Electrical vs. mechanical
 * - Invasive vs. non-invasive
 * - Portable vs. stationary
 *
 * When assessing applicability, document specific device traits that justify
 * requirement omission. The justification should clearly demonstrate why the
 * requirement addresses aspects not relevant to the device.
 *
 * # Rating Guidelines
 * 1. Evaluate implementation evidence comprehensively
 * 2. Consider regulatory requirements and expectations
 * 3. Document device-specific applicability justifications
 * 4. Maintain consistent assessment criteria
 */
export type ComplianceRating = number;

/**
 * Rating indicating confidence in the assessment\'s accuracy and completeness (0-100)
 *
 * The confidence rating reflects the reliability of the assessment based on
 * available evidence, documentation quality, and clarity of requirements.
 *
 *# Confidence Rating Scale
 *
 *The confidence rating reflects how certain an evaluator is about the provided assessment. It accounts for factors such as the level of agreement between different inspections, the presence of ambiguous or inconsistent information, and the similarity of compliance scores from independent evaluators. Each criterion below is treated as an **OR** operator, meaning meeting any one of the conditions can determine the confidence level. The rating does **not** depend on the level of implementation or the amount of documentation available, which instead impacts the compliance rating.
 *
 *## 0.95-1.00: Highest Confidence
 *- High agreement across independent evaluations **OR**
 *- No ambiguity or inconsistencies in the evidence **OR**
 *- Requirements are unambiguous and directly relevant to the device **OR**
 *- Clear and consistent evidence supporting the assessment
 *
 *## 0.80-0.94: Strong Confidence
 *- Strong agreement across most evaluations **OR**
 *- Minimal ambiguity or inconsistencies in the evidence **OR**
 *- Requirements well understood and relevant to the device **OR**
 *- Minor areas requiring interpretation
 *
 *## 0.60-0.79: Good Confidence
 *- General agreement across evaluations **OR**
 *- Some ambiguity or inconsistencies in the evidence **OR**
 *- Requirements generally clear but may need interpretation **OR**
 *- Reasonable level of consistency in available evidence
 *
 *## 0.40-0.59: Moderate Confidence
 *- Partial agreement across evaluations **OR**
 *- Notable ambiguity or inconsistencies in the evidence **OR**
 *- Requirements need significant interpretation **OR**
 *- Mixed or uneven clarity in evidence across assessments
 *
 *## 0.20-0.39: Limited Confidence
 *- Minimal agreement across evaluations **OR**
 *- High level of ambiguity or inconsistencies in the evidence **OR**
 *- Requirements unclear or difficult to apply **OR**
 *- Conflicting information across assessments
 *
 *## 0.01-0.19: Very Low Confidence
 *- Little to no agreement across evaluations **OR**
 *- Evidence largely ambiguous or conflicting **OR**
 *- Requirements poorly defined or highly subjective **OR**
 *- Lack of coherence in available evidence
 *
 *## 0.00: No Confidence
 *- No agreement across evaluations **OR**
 *- Evidence entirely absent or unusable **OR**
 *- Requirements undefined or irrelevant **OR**
 *- No actionable information available for assessment
 */
export type ConfidenceRating = number;

export interface SectionAssessment {
    abstract_text: string;
    compliance_rating: ComplianceRating;
    requirement_assessments?: Map<IdType, RequirementOrRequirementGroupAssessment>;
}

export interface ReportAbstractAndTitle {
    abstract_text: string;
    title: string;
}

export interface RequirementGroupAssessment {
    compliance_rating: ComplianceRating;
    /**
     * Comprehensive explanation of the compliance assessment, including methodology and findings
     */
    details: string;
    /**
     * Brief overview of the compliance status and key findings
     */
    summary: string;
    assessments?: Map<IdType, RequirementOrRequirementGroupAssessment>;
}

export interface AssessmentQuote {
    raw: RawQuote;
    relevancy_score: Percentage;
    pretty: string;
}

export interface RawQuote {
    document_title: string;
    start_line: number;
    end_line: number;
    total_lines_on_page: number;
    page: number;
    content: string;
}

export type RequirementOrRequirementGroupAssessment = { requirement: RequirementAssessment } | { requirement_group: RequirementGroupAssessment };

export interface Suggestion {
    kind: SuggestionKind;
    description: string;
    content: string;
}

export interface LlmConfig {
    model: LlmModel;
    temperature: number | undefined;
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

export interface EmbedConfig {
    model: EmbedModel;
    regulation_vector_search_limit: number;
    user_documentation_vector_search_limit: number;
    tokens_per_chunk: number;
    token_overlap: number;
}

/**
 * Rating indicating probability of an auditor determining the requirement\'s applicability (0-100)
 *
 * The applicability rating reflects the likelihood that an auditor would determine a requirement
 * applies to the specific device or documentation being assessed. This provides a standardized
 * way to evaluate requirement scope and applicability determination.
 *
 * # Applicability Rating Scale (0-100)
 *
 * ## 95-100: Definitively Applicable
 * - >95% probability auditor would determine requirement applies
 * - Device/documentation clearly within requirement scope
 * - No reasonable auditor would exclude requirement
 * - Clear regulatory guidance supports applicability
 *
 * ## 80-94: Strongly Applicable  
 * - ~90% probability auditor would include requirement
 * - May receive questions about specific aspects
 * - Strong evidence supports applicability
 * - Conservative interpretation favors inclusion
 *
 * ## 60-79: Likely Applicable
 * - ~75% probability auditor would apply requirement
 * - Some interpretation differences possible
 * - Most evidence supports applicability
 * - Safer to include than exclude
 *
 * ## 40-59: Uncertain Applicability
 * - 50% chance of differing auditor interpretations
 * - Significant regulatory ambiguity exists
 * - Equal evidence for/against applicability
 * - Further guidance/clarification needed
 *
 * ## 20-39: Likely Not Applicable
 * - ~25% probability auditor would apply requirement
 * - Most evidence suggests non-applicability
 * - Device characteristics indicate exclusion
 * - Some interpretation risk remains
 *
 * ## 1-19: Almost Certainly Not Applicable
 * - <10% chance auditor would apply requirement
 * - Clear evidence of non-applicability
 * - Strong regulatory basis for exclusion
 * - Only theoretical applicability scenarios
 *
 * ## 0: Definitively Not Applicable
 * - 0% probability of applicability determination
 * - Explicit regulatory exclusion exists
 * - Logically impossible to apply
 * - No reasonable interpretation supports inclusion
 *
 * # Assessment Guidelines
 *
 * 1. Regulatory Framework
 *    - Review applicable regulations and guidance
 *    - Consider common auditor interpretations
 *    - Evaluate historical precedents
 *    - Assess regulatory clarity
 *
 * 2. Device Characteristics
 *    - Compare to requirement scope
 *    - Evaluate technical alignment
 *    - Consider intended use match
 *    - Assess risk classification
 *
 * 3. Documentation Context
 *    - Review lifecycle stage relevance
 *    - Consider version applicability
 *    - Evaluate temporal scope
 *    - Assess documentation completeness
 *
 * 4. Interpretation Risk
 *    - Consider auditor variability
 *    - Evaluate regulatory ambiguity
 *    - Assess precedent consistency
 *    - Review guidance clarity
 */
export type ApplicabilityRating = number;

export interface Task {
    id?: IdType;
    status?: TaskStatus;
    title: string;
    description: string;
    task: string;
    suggestion: Suggestion | undefined;
    associated_document: string | undefined;
    misc?: Json | undefined;
}

export interface Requirement {
    id: IdType;
    name: string;
    description: string;
    reference: string | undefined;
    documentation_search_instruction: string;
}

export interface RequirementGroup {
    id: IdType;
    name: string;
    description: string;
    reference: string | undefined;
}

export interface Section {
    id: IdType;
    name: string;
    description: string;
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
    openai_file_id: string | undefined;
}

export interface Report {
    id: IdType;
    status: ReportStatus;
    regulatory_framework: RegulatoryFramework;
    created_date: DateTime<Utc>;
    title: string;
    abstract_text: string;
    compliance_rating: ComplianceRating;
    section_assessments: Map<Id, SectionAssessment>;
}

export interface User {
    id: IdType;
    first_name: string;
    last_name: string;
    email: Email;
    job_title: string | undefined;
    company: string | undefined;
    config?: UserConfig;
    preferences?: Json | undefined;
}

export interface Thread {
    id: IdType;
    conversation: Messages;
    logs: string[];
}

export type ProgressEvent = { Report: [IdType, number] };

export type UpdateEvent = { File: IdType } | { User: IdType } | { Requirement: IdType };

export type DeleteEvent = { File: IdType };

export type CreateEvent = { File: IdType } | { Report: IdType };

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

export type FileStatus = "uploading" | "processing" | "ready" | { upload_failed: string } | { processing_failed: string };

export interface FileChunk {
    id: ChunkId;
    data: ArcBytes;
}

export type Percentage = number;

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
    domain: string;
    client_id: string;
    login_redirect_uri: string;
    logout_redirect_uri: string;
}

export interface AuthIdentity {
    id_token: string;
    access_token: string;
    refresh_token: string;
}

export type ArcStr = string;

export type ArcBytes = Uint8Array;

export type Json = string;

export type IdStringMap = Map<IdType, string>;

export interface FullFile {
    meta: File;
    data: ArcBytes;
}

export class IntoUnderlyingByteSource {
  private constructor();
  free(): void;
  start(controller: ReadableByteStreamController): void;
  pull(controller: ReadableByteStreamController): Promise<any>;
  cancel(): void;
  readonly type: ReadableStreamType;
  readonly autoAllocateChunkSize: number;
}
export class IntoUnderlyingSink {
  private constructor();
  free(): void;
  write(chunk: any): Promise<any>;
  close(): Promise<any>;
  abort(reason: any): Promise<any>;
}
export class IntoUnderlyingSource {
  private constructor();
  free(): void;
  pull(controller: ReadableStreamDefaultController): Promise<any>;
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
  readonly upload_file_chunk: (a: number) => number;
  readonly get_user: () => number;
  readonly get_task: (a: number) => number;
  readonly get_report: (a: number) => number;
  readonly get_all_reports: () => number;
  readonly get_file: (a: number) => number;
  readonly get_requirement: (a: number) => number;
  readonly get_requirement_group: (a: number) => number;
  readonly get_sections: (a: number) => number;
  readonly get_tasks_by_report: (a: number) => number;
  readonly get_tasks_by_report_and_requirement: (a: number) => number;
  readonly get_tasks_by_document: (a: number) => number;
  readonly get_requirement_groups_by_section: (a: number) => number;
  readonly get_child_requirement_groups: (a: number) => number;
  readonly get_requirements_by_group: (a: number) => number;
  readonly get_all_sections: () => number;
  readonly get_all_files: () => number;
  readonly get_all_requirements: () => number;
  readonly get_all_requirement_groups: () => number;
  readonly create_user: (a: number) => number;
  readonly create_report: (a: number) => number;
  readonly create_file: (a: number) => number;
  readonly update_user: (a: number) => number;
  readonly update_task: (a: number) => number;
  readonly user_exists: () => number;
  readonly is_admin: () => number;
  readonly admin_upload_report: (a: number) => number;
  readonly new_file: (a: number) => number;
  readonly admin_get_threads_by_report: (a: number) => number;
  readonly admin_get_threads_by_section: (a: number) => number;
  readonly admin_get_threads_by_requirement_group: (a: number) => number;
  readonly admin_get_threads_by_requirement: (a: number) => number;
  readonly get_file_data: (a: number) => number;
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
  readonly __wbindgen_export_2: (a: number) => void;
  readonly __wbindgen_export_3: (a: number, b: number, c: number) => void;
  readonly __wbindgen_export_4: WebAssembly.Table;
  readonly __wbindgen_export_5: (a: number, b: number) => void;
  readonly __wbindgen_export_6: (a: number, b: number) => void;
  readonly __wbindgen_export_7: (a: number, b: number, c: number) => void;
  readonly __wbindgen_export_8: (a: number, b: number, c: number) => void;
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
