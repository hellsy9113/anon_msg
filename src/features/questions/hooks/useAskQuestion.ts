import {  useState } from "react";
import {  isAxiosError } from "axios";
import { toast } from "sonner";
import {
  createQuestion,
} from "@/features/questions/services/questions.service";
export function useAskQuestion() {
  const [loading, setLoading] = useState(false);
  const askQuestion = async (content: string) => {
    try {
      setLoading(true);
      const response =
        await createQuestion(content);

      toast.success(response.message);
      return true;
    } catch (error) {
      const axiosError = error;

      if (isAxiosError(axiosError)) {
        toast.error(
          axiosError.response?.data.message ?? "Failed to fetch settings",
        );
      } else {
        toast.error("An unexpected error occurred");
      }
      return false
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    askQuestion
  };
}
