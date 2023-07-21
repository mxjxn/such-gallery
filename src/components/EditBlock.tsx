import React, {FC, ChangeEvent} from 'react';

interface EditBlockProps {
  isEditing: boolean;
  setIsEditing: (newValue: boolean) => void;
  value: string;
  setValue: (newValue: string) => void;
  updateHandler: (event: React.MouseEvent<HTMLElement>) => void;
  placeHolder: string;
}

const EditBlock: FC<EditBlockProps> = ({
  isEditing,
  setIsEditing,
  value,
  setValue,
  updateHandler,
  placeHolder
}) => {
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => 
    setValue(e.target.value)

  const handleCancelClick = () => setIsEditing(false)

  return isEditing ? (
    <div className="m-0 py-2">
      <input
        className="input input-bordered w-full max-w-xs text-white bg-slate-900"
        placeholder={value}
        onChange={handleInputChange}
      />
      <button
        className="text-white bg-red-500 inline-block p-2 m-1 rounded-lg cursor-pointer hover:border-red-200 border border-red-500 active:bg-red-400 transition-colors"
        onClick={handleCancelClick}
      >
        Cancel
      </button>
      <div
        className="text-white bg-green-500 inline-block p-2 m-1 rounded-lg cursor-pointer hover:border-green-100 border border-green-500 transition-colors active:bg-green-400"
        onClick={updateHandler}
      >
        Save
      </div>
    </div>
  ) : (
    <p
      className="p-2 m-0 flex items-center"
      onClick={() => setIsEditing(true)}
    >
      <span className="text-slate-400 text-sm pr-2 underline w-14">
        {placeHolder}
      </span>
      {value}
    </p>
  );
};

export default EditBlock;
