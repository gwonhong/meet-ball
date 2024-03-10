'use client';
import { deleteMeet } from '../../controllers/meet';
import { MdDelete as DeleteIcon } from 'react-icons/md';

export default function DeleteButton({ meetId }: { meetId: string }) {
  return (
    <div onClick={async () => await deleteMeet(meetId)}>
      <DeleteIcon size={20} />
    </div>
  );
}