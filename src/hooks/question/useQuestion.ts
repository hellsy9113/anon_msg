import { useCallback, useEffect, useState } from "react";
import axios, { isAxiosError } from "axios";
import { toast } from "sonner";

import { Question } from "@/types/Question";

export function useQuestions() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        "/api/fetch-questions"
      );
  
      setQuestions(
        response.data.questions || []
      );
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(
          error.response?.data.message ??
            "Failed to fetch questions"
        );
      } else {
        toast.error(
          "An unexpected error occurred"
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    questions,
    loading,
    fetchQuestions,
    setQuestions,
  };
}

interface QuestionResponse{
  success:boolean;
  question:Question;
}

export function useQuestion(questionId:string)
{
  const[question,setQuestion]=
    useState<Question|null>(null);

  const [loading,setLoading]=useState(false);

  const fetchQuestion= useCallback(async()=>{
    if(!questionId)
      return null;

    try{
      setLoading(true);
      const response=await axios.get<QuestionResponse>(
        `/api/question/${questionId}`
      );
      console.log(response);
      setQuestion(response.data.question);

    }
    catch (error) {
      if (isAxiosError(error)) {
        toast.error(
          error.response?.data.message ??
            "Failed to fetch question"
        );
      } else {
        toast.error(
          "An unexpected error occurred"
        );
      }
    } finally {
      setLoading(false);
    }
  },[questionId]);


useEffect(() => {
  if (questionId) {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchQuestion();
  }
}, [questionId, fetchQuestion]);
  const deleteMessageLocally=(messageId:string)=>{
    setQuestion((prev)=>{
      if(!prev)
        return prev;
      return{
        ...prev,
        messages:prev.messages.filter(
          (msg)=>
              msg._id?.toString() !== messageId
        )
      }
    })
  }
  return{
     question,
     loading,
     fetchQuestion,
    deleteMessageLocally
  }
}