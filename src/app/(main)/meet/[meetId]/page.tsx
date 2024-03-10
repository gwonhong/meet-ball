import { ParticipantsOnMeets, Prisma } from '@prisma/client';
import type CombinedTimeTable from '@/types/CombinedTimeTable';
import TimeTableComponent from '@/components/timeTable/timetable';
import {
  getMeet,
  getMeetWithParticipants,
  getMyParticipatingMeets,
} from '@/controllers/meet';
import { redirect } from 'next/navigation';
import EditMeetButton from '../EditMeetButton';
import ParticipantsButton from '../ParticipantsButton';
import MeetDescription from '../MeetDescription';
import ShareLinkButton from '../ShareLinkButton';
import { getCurrentUser } from '@/lib/authentication';
import TimeTable from '@/types/TimeTable';

export default async function MeetPage({
  params,
}: {
  params: { meetId: string };
}) {
  try {
    const myParticipatingMeets = await getMyParticipatingMeets();
    // 1. check if I'm participating in this meet
    if (!myParticipatingMeets.some(meet => meet.id === params.meetId)) {
      // 2. if not, check if the meet exists
      const meet = await getMeet(params.meetId);
      if (!meet) throw new Error('meet not found');
      // 3. if it exists, redirect to participate page (ask to join or not)
      redirect(`/meet/${params.meetId}/participate`);
    }
  } catch (error) {
    console.error(error);
    redirect('/');
  }

  const meet = await getMeetWithParticipants(params.meetId);
  const currentUser = await getCurrentUser();

  function combineTimeTables(participants: ParticipantsOnMeets[]) {
    const combinedTimeTable: CombinedTimeTable = {};
    for (const key of meet.datesOrDays) {
      combinedTimeTable[key] = {};
    }

    for (const participant of participants) {
      const userId = participant.userId;
      const currentTimeTable = participant.timeTable as Prisma.JsonObject;
      for (const key in currentTimeTable) {
        combinedTimeTable[key][userId] = currentTimeTable[key] as number[];
      }
    }
    return combinedTimeTable;
  }
  const combinedTimeTable = combineTimeTables(meet.participants);

  return (
    <div className="pb-8 px-20">
      <div className="flex items-center w-full">
        <p className="text-xl mt-3 grow">{meet.name}</p>
        <ShareLinkButton meetId={params.meetId} />
        <EditMeetButton meetId={params.meetId} />
      </div>
      <MeetDescription description={meet.description} />
      <TimeTableComponent
        startTime={meet.startTime}
        endTime={meet.endTime}
        datesOrDays={meet.datesOrDays}
        type={meet.meetType}
        timetable={combinedTimeTable}
        participantsNum={meet.participants.length}
        isManager={currentUser.id === meet.managerId}
        confirmedTimeTable={meet.confirmedTimeTable || {}}
        meetId={params.meetId}
      />
    </div>
  );
}
