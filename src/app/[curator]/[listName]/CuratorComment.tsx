"use client";
import React, { useEffect } from "react";
import EditableText from "@/components/EditableText";
import { useProfile } from "@/hooks/useProfile";
import { updateNftCuratorComment } from "@/app/curated";
import { useMutation } from "@tanstack/react-query";

export default function CuratorComment({
  comment,
  listId,
  nftId,
  curatorId,
}: {
  comment: string;
  listId: number;
  nftId: number;
  curatorId?: number;
}) {
  const { user } = useProfile();
  const { mutate } = useMutation({
    mutationFn: (note: string) =>
      updateNftCuratorComment(listId, nftId, note),
    onSuccess: () => {console.log("success updating curator comment")},
		onError: (e) => {console.error("error updating curator comment", e)}
  });

  return (
    <div>
      {user?.id == curatorId ? (
        <div 
					className="py-3"
				>
          <EditableText
            label="comment"
            initialValue={comment}
            updateHandler={mutate}
          />
        </div>
      ) : (
				<div>{comment}</div>
			)}
    </div>
  );
}
