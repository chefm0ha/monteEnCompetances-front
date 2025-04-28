import axios from "axios"
import { API_URL } from "../config/constants"

class ContenuService {
  async getAllContenus() {
    const response = await axios.get(`${API_URL}/contenus`)
    return response.data
  }

  async getContenuById(id) {
    const response = await axios.get(`${API_URL}/contenus/${id}`)
    return response.data
  }

  async createContenu(contenuData) {
    const response = await axios.post(`${API_URL}/contenus`, contenuData)
    return response.data
  }

  async updateContenu(id, contenuData) {
    const response = await axios.put(`${API_URL}/contenus/${id}`, contenuData)
    return response.data
  }

  async deleteContenu(id) {
    const response = await axios.delete(`${API_URL}/contenus/${id}`)
    return response.data
  }

  async uploadFile(file) {
    const formData = new FormData()
    formData.append("file", file)
    
    const response = await axios.post(`${API_URL}/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data.url
  }
}

export const contenuService = new ContenuService() 