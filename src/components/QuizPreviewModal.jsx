import { Dialog, DialogContent } from "./ui/dialog";
import QuizPreview from "./QuizPreview";

const QuizPreviewModal = ({ open, onOpenChange, quiz }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <QuizPreview 
          quiz={quiz} 
          onClose={() => onOpenChange(false)} 
        />
      </DialogContent>
    </Dialog>
  );
};

export default QuizPreviewModal;