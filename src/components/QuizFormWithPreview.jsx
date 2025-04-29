import { useState } from "react";
import { Button } from "./ui/button";
import { Eye } from "lucide-react";
import QuizForm from "./QuizForm";
import QuizPreviewModal from "./QuizPreviewModal";

const QuizFormWithPreview = ({ onSave, initialData = null, moduleId = null }) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState(initialData);
  
  // Mise à jour du quiz pour la prévisualisation
  const handleQuizChange = (quiz) => {
    setCurrentQuiz(quiz);
  };
  
  // Sauvegarde le quiz et ferme la modal si elle est ouverte
  const handleSave = (quiz) => {
    onSave(quiz);
    if (previewOpen) {
      setPreviewOpen(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button 
          variant="outline" 
          onClick={() => setPreviewOpen(true)}
          disabled={!currentQuiz || currentQuiz.questions.length === 0}
        >
          <Eye className="h-4 w-4 mr-2" />
          Prévisualiser le quiz
        </Button>
      </div>
      
      <QuizForm 
        onSave={handleSave} 
        initialData={initialData} 
        moduleId={moduleId}
        onChange={handleQuizChange}
      />
      
      <QuizPreviewModal 
        open={previewOpen} 
        onOpenChange={setPreviewOpen} 
        quiz={currentQuiz} 
      />
    </div>
  );
};

export default QuizFormWithPreview;