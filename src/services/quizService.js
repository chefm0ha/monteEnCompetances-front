import axios from "axios";
import { API_URL } from "../config";

// Create axios instance with base configuration
const API = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Add token to requests
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const quizService = {
  // ======== QUIZ MANAGEMENT ========
  
  /**
   * Get all quizzes for a module
   */
  getQuizzesByModule: async (moduleId) => {
    try {
      const response = await API.get(`/api/admin/formations/modules/${moduleId}/quizzes`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching quizzes for module ${moduleId}:`, error);
      throw error;
    }
  },

  /**
   * Get a specific quiz by ID with questions
   */
  getQuizById: async (quizId) => {
    try {
      const response = await API.get(`/api/admin/formations/quizzes/${quizId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching quiz ${quizId}:`, error);
      throw error;
    }
  },

  /**
   * Create a simple quiz
   */
  createQuiz: async (moduleId, quizData) => {
    try {
      const response = await API.post(`/api/admin/formations/modules/${moduleId}/quizzes`, quizData);
      return response.data;
    } catch (error) {
      console.error(`Error creating quiz for module ${moduleId}:`, error);
      throw error;
    }
  },

  /**
   * Create a complete quiz with questions and choices
   */
  createCompleteQuiz: async (moduleId, quizData) => {
    try {
      const response = await API.post(`/api/admin/formations/modules/${moduleId}/quizzes/complete`, quizData);
      return response.data;
    } catch (error) {
      console.error(`Error creating complete quiz for module ${moduleId}:`, error);
      throw error;
    }
  },

  /**
   * Update a quiz
   */
  updateQuiz: async (quizId, quizData) => {
    try {
      const response = await API.put(`/api/admin/formations/quizzes/${quizId}`, quizData);
      return response.data;
    } catch (error) {
      console.error(`Error updating quiz ${quizId}:`, error);
      throw error;
    }
  },

  /**
   * Update a complete quiz with questions and choices
   */
  updateCompleteQuiz: async (quizId, quizData) => {
    try {
      const response = await API.put(`/api/admin/formations/quizzes/${quizId}/complete`, quizData);
      return response.data;
    } catch (error) {
      console.error(`Error updating complete quiz ${quizId}:`, error);
      throw error;
    }
  },

  /**
   * Delete a quiz
   */
  deleteQuiz: async (quizId) => {
    try {
      const response = await API.delete(`/api/admin/formations/quizzes/${quizId}`);
      return response.status === 204;
    } catch (error) {
      console.error(`Error deleting quiz ${quizId}:`, error);
      throw error;
    }
  },

  /**
   * Evaluate quiz answers
   */
  evaluateQuiz: async (quizId, userAnswers) => {
    try {
      const response = await API.post(`/api/admin/formations/quizzes/${quizId}/evaluate`, userAnswers);
      return response.data;
    } catch (error) {
      console.error(`Error evaluating quiz ${quizId}:`, error);
      throw error;
    }
  },

  // ======== QUESTION MANAGEMENT ========

  /**
   * Get all questions for a quiz
   */
  getQuestionsByQuiz: async (quizId) => {
    try {
      const response = await API.get(`/api/admin/formations/quizzes/${quizId}/questions`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching questions for quiz ${quizId}:`, error);
      throw error;
    }
  },

  /**
   * Create a question
   */
  createQuestion: async (quizId, questionData) => {
    try {
      const response = await API.post(`/api/admin/formations/quizzes/${quizId}/questions`, questionData);
      return response.data;
    } catch (error) {
      console.error(`Error creating question for quiz ${quizId}:`, error);
      throw error;
    }
  },

  /**
   * Update a question
   */
  updateQuestion: async (questionId, questionData) => {
    try {
      const response = await API.put(`/api/admin/formations/questions/${questionId}`, questionData);
      return response.data;
    } catch (error) {
      console.error(`Error updating question ${questionId}:`, error);
      throw error;
    }
  },

  /**
   * Delete a question
   */
  deleteQuestion: async (questionId) => {
    try {
      const response = await API.delete(`/api/admin/formations/questions/${questionId}`);
      return response.status === 204;
    } catch (error) {
      console.error(`Error deleting question ${questionId}:`, error);
      throw error;
    }
  },

  // ======== CHOICE MANAGEMENT ========

  /**
   * Get all choices for a question
   */
  getChoicesByQuestion: async (questionId) => {
    try {
      const response = await API.get(`/api/admin/formations/questions/${questionId}/choix`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching choices for question ${questionId}:`, error);
      throw error;
    }
  },

  /**
   * Create a single choice
   */
  createChoice: async (questionId, choiceData) => {
    try {
      const response = await API.post(`/api/admin/formations/questions/${questionId}/choix`, choiceData);
      return response.data;
    } catch (error) {
      console.error(`Error creating choice for question ${questionId}:`, error);
      throw error;
    }
  },

  /**
   * Create multiple choices at once
   */
  createMultipleChoices: async (questionId, choicesData) => {
    try {
      const response = await API.post(`/api/admin/formations/questions/${questionId}/choix/multiple`, choicesData);
      return response.data;
    } catch (error) {
      console.error(`Error creating multiple choices for question ${questionId}:`, error);
      throw error;
    }
  },

  /**
   * Update a choice
   */
  updateChoice: async (choiceId, choiceData) => {
    try {
      const response = await API.put(`/api/admin/formations/choix/${choiceId}`, choiceData);
      return response.data;
    } catch (error) {
      console.error(`Error updating choice ${choiceId}:`, error);
      throw error;
    }
  },

  /**
   * Delete a choice
   */
  deleteChoice: async (choiceId) => {
    try {
      const response = await API.delete(`/api/admin/formations/choix/${choiceId}`);
      return response.status === 204;
    } catch (error) {
      console.error(`Error deleting choice ${choiceId}:`, error);
      throw error;
    }
  },

  // ======== UTILITY METHODS ========

  /**
   * Transform frontend quiz data to backend format
   */
  transformQuizForBackend: (frontendQuiz) => {
    return {
      titre: frontendQuiz.titre,
      description: frontendQuiz.description,
      seuilReussite: frontendQuiz.seuilReussite,
      questions: frontendQuiz.questions?.map(question => ({
        contenu: question.contenu,
        choix: question.choix?.map(choice => ({
          contenu: choice.contenu,
          estCorrect: choice.estCorrect
        }))
      }))
    };
  },

  /**
   * Transform backend quiz data to frontend format
   */
  transformQuizFromBackend: (backendQuiz) => {
    return {
      id: backendQuiz.id,
      titre: backendQuiz.titre,
      description: backendQuiz.description,
      seuilReussite: backendQuiz.seuilReussite,
      moduleId: backendQuiz.moduleId,
      questions: backendQuiz.questions?.map(question => ({
        id: question.id,
        contenu: question.contenu,
        choix: question.choix?.map(choice => ({
          id: choice.id,
          contenu: choice.contenu,
          estCorrect: choice.estCorrect
        }))
      })) || []
    };
  }
};