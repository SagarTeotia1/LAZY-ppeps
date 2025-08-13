import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../utils/axiosinstance";

const fetchseller = async() =>{
    const response = await axiosInstance.get("/api/logged-in-seller")
    return response.data.seller;
}

const useseller = ()=>{
    const {
        data: seller,
        isLoading,
        isError,
        refetch,
    }  =useQuery({
        queryKey:["seller"],
        queryFn: fetchseller,
        staleTime: 1000*60*5,
        retry:1,
    });

    return{seller, isLoading,isError,refetch}
};

export default useseller;