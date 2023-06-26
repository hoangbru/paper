"use client";

import React, { FC, useRef, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import Button from "./ui/Button";
// import { HiOutlinePaperAirplane } from "react-icons/hi2";
import { HiOutlinePaperAirplane } from "react-icons/hi";
import axios from "axios";
import { toast } from "react-hot-toast";

type ChatInputProps = {
  chatPartner: User;
  chatId: string;
};

const ChatInput: FC<ChatInputProps> = ({ chatPartner, chatId }) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const sendMessage = async () => {
    setIsLoading(true);
    try {
      await axios.post("/api/message/send", {
        text: input,
        chatId,
      });
      setInput('')
      textareaRef.current?.focus()
    } catch {
        toast.error('Đã có lỗi xảy ra, vui lòng thử lại sau!')
    } finally {
        setIsLoading(false)
    }
  };
  return (
    <div className="flex items-center gap-3 border-t border-gray-200 px-4 pt-4 mb-2 sm:mb-0">
      <div className="relative flex-1 overflow-hidden rounded-lg shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-gray-600">
        <TextareaAutosize
          ref={textareaRef}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Nhập tin nhắn..."
          className="block w-full resize-none border-0 bg-transparent text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:py-1.5 sm:text-sm sm:leading-6"
        />

        {/* <div
          onClick={() => textareaRef.current?.focus()}
          className="py-2"
          aria-hidden="true"
        >
          <div className="py-px">
            <div className="h-9" />
          </div>
        </div> */}

        {/* <div className="absolute right-0 bottom-0 flex justify-between py-2 pl-3 pr-2">
          <div className="flex-shrin-0">
            <Button
                isLoading={isLoading}
                onClick={sendMessage} type='submit'
            >
                <HiOutlinePaperAirplane size={24}/>
            </Button>
          </div>
        </div> */}
      </div>

      {!isLoading ? (
        <Button
          variant="ghost"
          isLoading={isLoading}
          onClick={sendMessage}
          type="submit"
        >
          <HiOutlinePaperAirplane size={24} />
        </Button>
      ) : (
        <Button variant="ghost" isLoading={isLoading}></Button>
      )}
    </div>
  );
};

export default ChatInput;
