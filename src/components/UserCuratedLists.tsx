"use client";
import React, { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createCuratedList,
  getUserCuratedListsByAddress,
  updateCuratedListTitle,
} from "@/app/curated";
import _ from "lodash";
import { useProfile } from "@/hooks/useProfile";
import EditableText from "./EditableText";

export default function UserCuratedLists() {
  const queryClient = useQueryClient();
  const { user, address } = useProfile();
  const { data, isLoading } = useQuery(
    ["userCuratedLists", address],
    async () => getUserCuratedListsByAddress(address)
  );
  const { mutate: createNewList } = useMutation({
    mutationFn: () => createCuratedList(user.id, "Wow such list"),
    onSuccess: (a: any) => {
      queryClient.invalidateQueries({
        queryKey: ["userCuratedLists", address],
      });
    },
  });
  const { mutate: updateListName } = useMutation({
    mutationFn: ({ id, title }: { id: number; title: string }) =>
      updateCuratedListTitle(id, title),
    onSuccess: (a: any) => {
      queryClient.invalidateQueries({
        queryKey: ["userCuratedLists", address],
      });
    },
  });
  useEffect(() => {
    console.log({ data });
  }, [data]);
  return (
    <div className="mb-4">
      <div className="flex justify-between">
        <h3 className="text-xl pl-3 pb-3 inline-block">Curated Lists</h3>
        <button className="btn btn-xs btn-secondary" onClick={createNewList}>
          Create list
        </button>
      </div>
      <div className="bg-zinc-800 p-2 pt-4 ">
        {!_.isEmpty(data) ? (
          _.map(data, (list, i) => {
            console.log({ i, list });
            return (
              <div key={`userCuratedList${i}`} className="bg-zinc-700 p-5 mb-3">
                <EditableText
									initialValue={list.title}
									updateHandler={(updatedTitle) => updateListName({ id:list.id, title: updatedTitle })}
								/>
              </div>
            );
          })
        ) : (
          <div className="">
            <p className="bg-zinc-700 p-5 mb-3">You have no curated lists.</p>
            <button className="btn btn-primary" onClick={createNewList}>
              Create a curated list
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
