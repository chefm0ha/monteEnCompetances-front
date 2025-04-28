import axios from "axios"
import { API_URL } from "../config/constants"

class ModuleService {
  async getAllModules() {
    const response = await axios.get(`${API_URL}/modules`)
    return response.data
  }

  async getModuleById(id) {
    const response = await axios.get(`${API_URL}/modules/${id}`)
    return response.data
  }

  async getModulesByFormation(formationId) {
    const response = await axios.get(`${API_URL}/modules/formation/${formationId}`)
    return response.data
  }

  async createModule(moduleData) {
    const response = await axios.post(`${API_URL}/modules`, moduleData)
    return response.data
  }

  async updateModule(id, moduleData) {
    const response = await axios.put(`${API_URL}/modules/${id}`, moduleData)
    return response.data
  }

  async deleteModule(id) {
    const response = await axios.delete(`${API_URL}/modules/${id}`)
    return response.data
  }

  async updateModuleOrder(moduleId, newOrder) {
    const response = await axios.patch(`${API_URL}/modules/${moduleId}/order`, { order: newOrder })
    return response.data
  }
}

export const moduleService = new ModuleService() 