/**
 * Module reorder request DTO
 * Matches the backend ModuleReorderRequestDTO
 */
export class ModuleReorderRequest {
  constructor(moduleIds) {
    this.moduleIds = moduleIds;
  }

  /**
   * Validates the reorder request
   * @returns {boolean} true if valid
   * @throws {Error} if invalid
   */
  validate() {
    if (!this.moduleIds) {
      throw new Error("La liste des IDs de modules ne peut pas être vide");
    }

    if (!Array.isArray(this.moduleIds)) {
      throw new Error("Les IDs de modules doivent être fournis sous forme de liste");
    }

    if (this.moduleIds.length === 0) {
      throw new Error("La liste des IDs de modules ne peut pas être vide");
    }

    // Check for duplicates
    const uniqueIds = new Set(this.moduleIds);
    if (uniqueIds.size !== this.moduleIds.length) {
      throw new Error("Les IDs de modules ne peuvent pas être dupliqués");
    }

    // Check that all IDs are valid
    for (const id of this.moduleIds) {
      if (!id || (typeof id !== 'string' && typeof id !== 'number')) {
        throw new Error("Tous les IDs de modules doivent être valides");
      }
    }

    return true;
  }

  /**
   * Converts to a plain object for API requests
   * @returns {Object}
   */
  toApiRequest() {
    this.validate();
    return {
      moduleIds: this.moduleIds
    };
  }
}

/**
 * Module reorder response DTO
 */
export class ModuleReorderResponse {
  constructor(success, message, modules, error) {
    this.success = success;
    this.message = message;
    this.modules = modules;
    this.error = error;
  }

  static fromApiResponse(response) {
    return new ModuleReorderResponse(
      response.success,
      response.message,
      response.modules,
      response.error
    );
  }
}
