// import { useCallback,useState } from "react";
// import axios, {AxiosError} from "axios";
// import {toast} from "sonner";
// import { ApiResponse } from "@/types/ApiResponse";

// export function useDeleteMessage()
// {
//      const [loading, setLoading] =
//         useState(false);
        
//         const deleteMessage=useCallback(async(messageId:string)=>{
//       try{
//          setLoading(true);
//          const response=await axios.delete<ApiResponse>(
//           `/api/delete-message/${messageId}`
//          );
//          toast.success(response.data.message);
//          return true;
//       }
//       catch(error)
//       {
//          const axiosError = error as AxiosError<ApiResponse>;

//       toast.error(
//         axiosError.response?.data.message ?? "Failed to delete message"
//       );

//       return false;
//       }
//       finally{
//         setLoading(false);
//       }
//         },[]);
//         return {
//         deleteMessage,
//         loading,
//         }
// }

// // import { useCallback, useState } from "react";
// // import axios, { AxiosError } from "axios";
// // import { toast } from "sonner";
// // import { ApiResponse } from "@/types/ApiResponse";

// // export function useDeleteMessage() {
// //   const [loading, setLoading] = useState(false);

// //   const deleteMessage = useCallback(async (messageId: string) => {
// //     try {
// //       setLoading(true);

// //       const response = await axios.delete<ApiResponse>(
// //         `/api/delete-message/${messageId}`
// //       );

// //       toast.success(response.data.message);
// //       return true;
// //     } catch (error) {
// //       const axiosError = error as AxiosError<ApiResponse>;

// //       toast.error(
// //         axiosError.response?.data.message ?? "Failed to delete message"
// //       );

// //       return false;
// //     } finally {
// //       setLoading(false);
// //     }
// //   }, []);

// //   return {
// //     deleteMessage,
// //     loading,
// //   };
// // }