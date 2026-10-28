/**
 * The Standard Schema v1 interface (https://standardschema.dev) — the shared
 * contract zod, valibot, arktype, and others expose under a `~standard` property.
 * It is *designed to be vendored*: we copy the interface here rather than take a
 * dependency, so `validateStandardSchema` interops with any conforming library
 * without pulling one in.
 *
 * Only the shape the runtime reads is used: `~standard.validate(value)`, which
 * returns a success (`{ value }`) or a failure (`{ issues }`), synchronously or
 * as a Promise. Each issue carries a `message` and an optional `path` locating
 * the offending value; `validateStandardSchema` maps that path to the matching
 * Field so the error lands where it belongs.
 */
export interface StandardSchemaV1<Input = unknown, Output = Input> {
  readonly '~standard': StandardSchemaV1.Props<Input, Output>;
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export declare namespace StandardSchemaV1 {
  /** The `~standard` properties a conforming schema exposes. */
  interface Props<Input = unknown, Output = Input> {
    /** The version number of the standard. */
    readonly version: 1;
    /** The vendor name of the schema library (e.g. `"zod"`, `"valibot"`). */
    readonly vendor: string;
    /** Validates a value — synchronously or asynchronously. */
    readonly validate: (value: unknown) => Result<Output> | Promise<Result<Output>>;
    /** Inferred input/output types — never present at runtime. */
    readonly types?: Types<Input, Output> | undefined;
  }

  /** The result of validating a value. */
  type Result<Output> = SuccessResult<Output> | FailureResult;

  /** A successful validation result. */
  interface SuccessResult<Output> {
    readonly value: Output;
    readonly issues?: undefined;
  }

  /** A failed validation result, carrying its issues. */
  interface FailureResult {
    readonly issues: ReadonlyArray<Issue>;
  }

  /** A single validation issue. */
  interface Issue {
    readonly message: string;
    readonly path?: ReadonlyArray<PropertyKey | PathSegment> | undefined;
  }

  /** A path segment in the object graph. */
  interface PathSegment {
    readonly key: PropertyKey;
  }

  /** The inferred input/output types of a schema. */
  interface Types<Input = unknown, Output = Input> {
    readonly input: Input;
    readonly output: Output;
  }

  /** Infers the output type of a Standard Schema. */
  type InferOutput<Schema extends StandardSchemaV1> = NonNullable<Schema['~standard']['types']>['output'];
}
