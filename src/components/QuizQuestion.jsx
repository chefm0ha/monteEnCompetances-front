"use client"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group"
import { Label } from "../components/ui/label"
import { cn } from "../lib/utils"

const QuizQuestion = ({ question, selectedAnswer, onAnswerSelect, showResults = false, isCorrect = null }) => {
  return (
    <Card
      className={cn(
        "w-full mb-6",
        showResults && isCorrect !== null && (isCorrect ? "border-green-500" : "border-red-500"),
      )}
    >
      <CardHeader>
        <CardTitle className="text-lg">{question.text}</CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={selectedAnswer?.toString()}
          onValueChange={(value) => onAnswerSelect(Number.parseInt(value))}
          disabled={showResults}
        >
          {question.choices.map((choice) => {
            const isSelected = selectedAnswer === choice.id
            const isCorrectAnswer = choice.isCorrect

            let className = ""
            if (showResults) {
              if (isCorrectAnswer) {
                className = "border-green-500 bg-green-50"
              } else if (isSelected && !isCorrectAnswer) {
                className = "border-red-500 bg-red-50"
              }
            }

            return (
              <div
                key={choice.id}
                className={cn(
                  "flex items-center space-x-2 p-3 rounded-md border mb-2",
                  isSelected && !showResults && "border-primary",
                  className,
                )}
              >
                <RadioGroupItem value={choice.id.toString()} id={`choice-${question.id}-${choice.id}`} />
                <Label htmlFor={`choice-${question.id}-${choice.id}`} className="flex-grow cursor-pointer">
                  {choice.text}
                </Label>
                {showResults && isCorrectAnswer && <span className="text-green-600 text-sm font-medium">Correct</span>}
              </div>
            )
          })}
        </RadioGroup>
      </CardContent>
    </Card>
  )
}

export default QuizQuestion

