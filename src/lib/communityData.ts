import {
  addDoc,
  collection,
  documentId,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  writeBatch,
} from 'firebase/firestore';
import { firestore } from './firebase';

export interface CommunitySubmissionInput {
  nameMode: 'anonymous' | 'named';
  name: string;
  pollOptionId: string;
  pollOption: string;
  rating: number;
  criticism: string;
}

export interface CommunitySubmission {
  id: string;
  nameMode: 'anonymous' | 'named';
  name: string;
  pollOptionId: string;
  pollOption: string;
  rating: number;
  criticism: string;
  createdAt: string;
}

export async function createCommunitySubmission(submission: CommunitySubmissionInput): Promise<void> {
  if (!firestore) {
    throw new Error('Konfigurasi Firebase belum tersedia. Kiriman tidak dapat disimpan.');
  }
  await addDoc(collection(firestore, 'communitySubmissions'), {
    ...submission,
    createdAt: serverTimestamp(),
  });
}

export function subscribeCommunitySubmissions(
  onSubmissions: (submissions: CommunitySubmission[]) => void,
  onError: (error: Error) => void,
): () => void {
  if (!firestore) {
    onError(new Error('Konfigurasi Firebase belum tersedia. Data kiriman tidak dapat dimuat.'));
    return () => {};
  }
  const submissions = collection(firestore, 'communitySubmissions');
  return onSnapshot(
    query(submissions, orderBy('createdAt', 'desc')),
    (snapshot) => {
      const records = snapshot.docs.flatMap((submission) => {
        const data = submission.data();
        if (
          (data.nameMode !== 'anonymous' && data.nameMode !== 'named') ||
          typeof data.name !== 'string' ||
          typeof data.pollOptionId !== 'string' ||
          typeof data.pollOption !== 'string' ||
          typeof data.rating !== 'number' ||
          typeof data.criticism !== 'string'
        ) {
          return [];
        }

        const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : '';
        return [{
          id: submission.id,
          nameMode: data.nameMode,
          name: data.name,
          pollOptionId: data.pollOptionId,
          pollOption: data.pollOption,
          rating: data.rating,
          criticism: data.criticism,
          createdAt,
        }];
      });
      onSubmissions(records);
    },
    onError,
  );
}

const LEGACY_KEYS = [
  'mataratu_poll_options',
  'mataratu_poll_has_voted',
  'mataratu_poll_selected_option',
  'mataratu_aspirations',
];

export async function resetCommunityData(): Promise<void> {
  if (!firestore) {
    throw new Error('Konfigurasi Firebase belum tersedia. Data kiriman tidak dapat dihapus.');
  }
  const submissions = collection(firestore, 'communitySubmissions');
  while (true) {
    const snapshot = await getDocs(query(submissions, orderBy(documentId()), limit(450)));
    if (snapshot.empty) return;

    const batch = writeBatch(firestore);
    snapshot.docs.forEach((submission) => batch.delete(submission.ref));
    await batch.commit();
    if (snapshot.size < 450) break;
  }
  LEGACY_KEYS.forEach((key) => window.localStorage.removeItem(key));
}
