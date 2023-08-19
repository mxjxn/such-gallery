import React, { FC, ChangeEvent, useState, MouseEvent } from "react";

interface EditBlockProps {
  initialValue: string;
  updateHandler: (newVal: string) => any;
  clickToEdit?: boolean;
	label?: string;
}

const EditableText: FC<EditBlockProps> = ({
  initialValue,
  updateHandler,
  clickToEdit = false,
	label,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialValue);
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) =>
    setValue(e.target.value);

  const handleCancelClick = () => {
    setIsEditing(false);
  };

  return isEditing ? (
    <div className="m-0 py-2 flex justify-end">
      <input
        className="input input-bordered flex-grow text-white bg-slate-900"
        placeholder={value}
        onChange={handleInputChange}
      />
      <button
        className="text-white bg-red-500 inline-block p-2 m-1 rounded-lg cursor-pointer hover:border-red-200 border border-red-500 active:bg-red-400 transition-colors"
        onClick={(e: MouseEvent) => {
          e.stopPropagation();
          handleCancelClick();
        }}
      >
        Cancel
      </button>
      <div
        className="text-white bg-green-500 inline-block p-2 m-1 rounded-lg cursor-pointer hover:border-green-100 border border-green-500 transition-colors active:bg-green-400"
        onClick={(e: MouseEvent) => {
          e.stopPropagation();
          updateHandler(value);
          setIsEditing(false);
        }}
      >
        Save
      </div>
    </div>
  ) : clickToEdit ? (
    <p
      className="p-2 m-0 border border-transparent hover:border-neutral-500 hover:border-dashed"
      onClick={() => setIsEditing(true)}
    >
      <span className="">{value}</span>
    </p>
  ) : (
    <p className="p-2 m-0 flex justify-between">
      <span className="">{value}</span>
      <button
        onClick={() => setIsEditing(true)}
        className="btn btn-xs btn-neutral"
      >
        edit {label}
      </button>
    </p>
  );
};

export default EditableText;
