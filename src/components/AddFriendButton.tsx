"use client";

import { FC, useState } from "react";
import Button from "./ui/Button";
import { addFriendValidator } from "@/libs/validators/add-friend";
import axios, { AxiosError } from "axios";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

interface AddFriendButtonProps {}

type FormData = z.infer<typeof addFriendValidator>;

const AddFriendButton: FC<AddFriendButtonProps> = () => {
  const [showSuccessState, setShowSuccessState] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(addFriendValidator),
  });

  const addFriend = async (email: string) => {
    setIsLoading(true);
    try {
      const validatedEmail = addFriendValidator.parse({ email });

      await axios.post("/api/friends/add", {
        email: validatedEmail,
      });

      setShowSuccessState(true);
    } catch (error) {
      if (error instanceof z.ZodError) {
        setError("email", { message: error.message });
        return;
      }

      if (error instanceof AxiosError) {
        setError("email", { message: error.response?.data });
        return;
      }

      setError("email", { message: "Đã có lỗi xảy ra" });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = (data: FormData) => {
    addFriend(data.email);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-sm">
      <label
        htmlFor="email"
        className="block text-base font-medium leading-6 text-gray-900"
      >
        Thêm bạn bè qua email
      </label>
      <div className="mt-2 flex gap-4">
        <input
          {...register("email")}
          type="text"
          className="block w-full rounded-md border-0 py-1.5 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-gray-700 sm:text-sm sm:leading-6"
          placeholder="you@example.com"
        />
        {!isLoading ? (
        <Button>Gửi</Button>
      ) : (
        <Button variant="ghost" isLoading={isLoading}></Button>
      )}
      </div>
      <p className="mt-1 text-sm text-red-600">{errors.email?.message}</p>
      {showSuccessState ? (
        <p className="mt-1 text-sm text-green-600">Đã gửi yêu cầu kết bạn</p>
      ) : null}
    </form>
  );
};

export default AddFriendButton;
