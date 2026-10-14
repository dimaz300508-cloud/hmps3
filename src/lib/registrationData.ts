import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { firestore } from './firebase';
import { RegisteredMember } from '../types';

export type RegistrationRecord = RegisteredMember & {
  id: string;
  className: string;
  secondaryDivision: string;
  motivation: string;
};

type NewRegistration = Omit<RegistrationRecord, 'id' | 'registeredAt'>;

export async function createRegistration(registration: NewRegistration): Promise<void> {
  if (!firestore) {
    throw new Error('Konfigurasi Firebase belum tersedia. Pendaftaran tidak dapat dikirim.');
  }

  await addDoc(collection(firestore, 'memberRegistrations'), {
    fullName: registration.fullName,
    nim: registration.nim,
    email: registration.email,
    phone: registration.phone,
    university: registration.university,
    major: registration.major,
    className: registration.className,
    division: registration.division,
    secondaryDivision: registration.secondaryDivision,
    motivation: registration.motivation,
    regCode: registration.regCode,
    createdAt: serverTimestamp(),
  });
}

export async function deleteRegistration(registrationId: string): Promise<void> {
  if (!firestore) {
    throw new Error('Konfigurasi Firebase belum tersedia. Data pendaftar tidak dapat dihapus.');
  }
  await deleteDoc(doc(firestore, 'memberRegistrations', registrationId));
}

export function subscribeRegistrations(
  onRegistrations: (registrations: RegistrationRecord[]) => void,
  onError: (error: Error) => void,
): () => void {
  if (!firestore) {
    onError(new Error('Konfigurasi Firebase belum tersedia.'));
    return () => {};
  }

  return onSnapshot(
    query(collection(firestore, 'memberRegistrations'), orderBy('createdAt', 'desc')),
    (snapshot) => {
      const records = snapshot.docs.flatMap((document) => {
        const data = document.data();
        if (
          typeof data.fullName !== 'string' ||
          typeof data.nim !== 'string' ||
          typeof data.email !== 'string' ||
          typeof data.phone !== 'string' ||
          typeof data.university !== 'string' ||
          typeof data.major !== 'string' ||
          typeof data.className !== 'string' ||
          typeof data.division !== 'string' ||
          typeof data.secondaryDivision !== 'string' ||
          typeof data.motivation !== 'string' ||
          typeof data.regCode !== 'string'
        ) {
          return [];
        }

        const registeredAt = data.createdAt instanceof Timestamp
          ? data.createdAt.toDate().toISOString()
          : '';
        return [{
          id: document.id,
          fullName: data.fullName,
          nim: data.nim,
          email: data.email,
          phone: data.phone,
          university: data.university,
          major: data.major,
          className: data.className,
          division: data.division,
          secondaryDivision: data.secondaryDivision,
          motivation: data.motivation,
          regCode: data.regCode,
          registeredAt,
        }];
      });
      onRegistrations(records);
    },
    onError,
  );
}
