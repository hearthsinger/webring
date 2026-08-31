'use strict';
/**
 * @file Error subclasses and enums for the webring
 * @author Asteria Hart <asteria@strawbs.io>
 */

/**
 * Object enum containing defined error codes
 * @readonly
 * @enum {string} error codes
 * */
export const ErrorCode = Object.freeze({
  /** Represents improper input to the ring */
  BadRingData: 'E1000',
  /** Represents an improper member within the ring */
  BadRingMember: 'E1001',
  /** Represents all known errors encountered serving requests */
  RequestHandlingError: 'E2000',
  /** Represents a generic error with one of the ring's integrations */
  IntegrationError: 'E3000',
  /** Represents a known config state error - should only be encountered at ring startup */
  IntegrationConfigError: 'E3001',
  /** Represents a known runtime/request-time error for one of the ring's integrations */
  IntegrationRuntimeError: 'E3002',
  /** Represents a generic error */
  GenericError: 'E9999',
});

/**
 * Object enum containing common HTTP error codes
 * @readonly
 * @enum {number} HTTP error codes
 */
export const HttpStatusCode = Object.freeze({
  /** Represents a 200 OK */
  Ok: 200,
  /** Represents a 400 Bad Request - this is a client error */
  BadRequest: 400,
  /** Represents a 404 Not Found - this is a client error */
  NotFound: 404,
  /** Represents a 500 Internal Server Error - this is a server error */
  InternalServerError: 500,
});

/**
 * Defines a generic RingError
 * @class
 * @abstract
 */
export class RingError extends Error {
  errorCode = null;
  httpError = null;
  constructor(
    msg,
    extensions = { errorCode: ErrorCode.GenericError, httpError: undefined },
  ) {
    super(msg);

    if (this.constructor === 'RingError') {
      throw new Error('RingError cannot be instantiated directly');
    }

    this.errorCode = extensions.errorCode ?? ErrorCode.GenericError;
    this.httpError = extensions.httpError ?? null;
  }
}

/**
 * Error subclass representing a generic issue with the ring data
 * @class
 */
export class RingDataError extends RingError {
  constructor(msg = 'Received invalid Ring data') {
    super(msg, { errorCode: ErrorCode.BadRingData });
  }
}

/**
 * Error subclass representing a generic issue with a specific ring member
 * @class
 */
export class RingMemberError extends RingError {
  constructor(msg = 'Received invalid Ring Member data') {
    super(msg, { errorCode: ErrorCode.BadRingMember });
  }
}

/**
 * Error subclass representing an HTTP 404
 * @class
 */
export class NotFoundError extends RingError {
  constructor(msg = 'Ring member not found') {
    super(msg, {
      errorCode: ErrorCode.RequestHandlingError,
      httpError: HttpStatusCode.NotFound,
    });
  }
}

/**
 * Error subclass representing an HTTP 400
 * @class
 */
export class BadRequestError extends RingError {
  constructor(msg = 'Bad ring member request') {
    super(msg, {
      errorCode: ErrorCode.RequestHandlingError,
      httpError: HttpStatusCode.BadRequest,
    });
  }
}

/**
 * Error subclass representing an HTTP 500, or any random error
 * @class
 */
export class UnknownError extends RingError {
  constructor(msg = 'An unknown error occurred') {
    super(msg, {
      errorCode: ErrorCode.GenericError,
      httpError: HttpStatusCode.InternalServerError,
    });
  }
}

export class IntegrationError extends RingError {
  _integrationId = null;

  constructor(
    integrationId,
    msg = "An error occurred with one of the ring's integrations",
  ) {
    super(msg, {
      errorCode: ErrorCode.IntegrationError,
      httpError: HttpStatusCode.InternalServerError,
    });

    this._integrationId = integrationId;
  }
}

export class IntegrationConfigError extends IntegrationError {
  constructor(
    integrationId,
    msg = 'An error occurred during configuration for an integration',
  ) {
    super(integrationId, msg, {
      errorCode: ErrorCode.IntegrationConfigError,
      httpError: HttpStatusCode.InternalServerError,
    });
  }
}

export class IntegrationRuntimeError extends IntegrationError {
  constructor(
    integrationId,
    msg = 'An error occurred handling an integration request',
  ) {
    super(integrationId, msg, {
      errorCode: ErrorCode.IntegrationRuntimeError,
      httpError: HttpStatusCode.BadRequest,
    });
  }
}
