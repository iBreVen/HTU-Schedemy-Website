import type {
  Course,
  ScheduleEntry,
  FullScheduleEntry,
  Instructor,
  TA,
  Room,
  TimeSlot,
} from './types';
import {
  instructors as initialInstructorsData,
  tas as initialTAs,
  rooms as initialRooms,
  timeSlots as initialTimeSlots,
  instructors as mockInitialInstructors,
  tas as mockInitialTAs,
  tas,
} from './data';

/**
 * IMPORTANT:
 * - Use the ALB DNS WITHOUT :8080 (your successful curl was on port 80).
 * - Configure this in Amplify env vars.
 */
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'http://schedemy-alb-1452462431.eu-central-1.elb.amazonaws.com';

const API_BASE_URL_ROUTING = `${API_BASE_URL.replace(/\/+$/, '')}/`;

interface AppState {
  instructors: Instructor[];
  tas: TA[];
  rooms: Room[];
  timeSlots: TimeSlot[];
  scheduleEntries: ScheduleEntry[];
}

const state: AppState = {
  instructors: [...mockInitialInstructors],
  tas: [...mockInitialTAs],
  rooms: [...initialRooms],
  timeSlots: [...initialTimeSlots],
  scheduleEntries: [],
};

function getBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.host}`;
  }
  return '';
}

// --- Course Management ---
export async function getCourses(): Promise<Course[]> {
  const url = `${API_BASE_URL_ROUTING}api/courses`;
  console.log(getBaseUrl());

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch courses: ${response.statusText} (status: ${response.status})`
      );
    }

    const coursesData = await response.json();

    if (!Array.isArray(coursesData)) {
      console.warn(
        `[DATA WARNING] Fetched courses data from ${url} is not an array:`,
        coursesData
      );
      return [];
    }

    return coursesData as Course[];
  } catch (error) {
    const typedError = error as Error;
    const isFetchFailedError =
      typedError instanceof TypeError &&
      typedError.message.toLowerCase().includes('fetch failed');

    if (isFetchFailedError) {
      console.warn(
        `[FETCH FAILED] Could not connect to the backend API for getCourses at ${url}. ` +
          `Please ensure your backend server is running and accessible. ` +
          `API_BASE_URL is: ${API_BASE_URL}. Details: ${typedError.message}`
      );
    } else {
      console.warn(
        `Error in getCourses when fetching from ${url}: ${typedError.message}`
      );
    }
    return [];
  }
}

export async function getCourseById(id: string): Promise<Course | undefined> {
  // NOTE: This endpoint may be inconsistent with getCourses() which uses /api/courses.
  // Keep as-is for now, but likely needs to be `${API_BASE_URL_ROUTING}api/courses/${id}`.
  const url = `${API_BASE_URL}/courses/${id}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 404) return undefined;
      throw new Error(
        `Failed to fetch course ${id}: ${response.statusText} (status: ${response.status})`
      );
    }

    return await response.json();
  } catch (error) {
    const typedError = error as Error;
    const isFetchFailedError =
      typedError instanceof TypeError &&
      typedError.message.toLowerCase().includes('fetch failed');

    if (isFetchFailedError) {
      console.warn(
        `[FETCH FAILED] Could not connect to the backend API for getCourseById at ${url}. ` +
          `Details: ${typedError.message}`
      );
    } else {
      console.warn(
        `Error fetching course ${id} from ${url}: ${typedError.message}`
      );
    }
    return undefined;
  }
}

export async function addCourse(course: Omit<Course, 'id'>): Promise<Course> {
  const url = `${API_BASE_URL}/courses`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(course),
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ error: 'Failed to add course and parse error response' }));
      throw new Error(
        errorData.details ||
          errorData.error ||
          `Failed to add course: ${response.statusText} (status: ${response.status})`
      );
    }

    return await response.json();
  } catch (error) {
    const typedError = error as Error;
    console.error(`Error in addCourse when posting to ${url}: ${typedError.message}`);
    if (
      typedError instanceof TypeError &&
      typedError.message.toLowerCase().includes('fetch failed')
    ) {
      console.warn(
        `[FETCH FAILED] Could not connect to the backend API for addCourse at ${url}.`
      );
    }
    throw error;
  }
}

export async function updateCourse(updatedCourse: Course): Promise<Course | null> {
  const url = `${API_BASE_URL}/courses/${updatedCourse.id}`;

  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedCourse),
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ error: 'Failed to update course and parse error response' }));
      throw new Error(
        errorData.details ||
          errorData.error ||
          `Failed to update course: ${response.statusText} (status: ${response.status})`
      );
    }

    return await response.json();
  } catch (error) {
    const typedError = error as Error;
    console.error(
      `Error in updateCourse when putting to ${url}: ${typedError.message}`
    );
    if (
      typedError instanceof TypeError &&
      typedError.message.toLowerCase().includes('fetch failed')
    ) {
      console.warn(
        `[FETCH FAILED] Could not connect to the backend API for updateCourse at ${url}.`
      );
    }
    throw error;
  }
}

export async function deleteCourse(id: string): Promise<boolean> {
  const url = `${API_BASE_URL}/courses/${id}`;

  try {
    const response = await fetch(url, { method: 'DELETE' });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ error: 'Failed to delete course and parse error response' }));
      throw new Error(
        errorData.details ||
          errorData.error ||
          `Failed to delete course: ${response.statusText} (status: ${response.status})`
      );
    }

    return true;
  } catch (error) {
    const typedError = error as Error;
    console.error(
      `Error in deleteCourse when deleting ${url}: ${typedError.message}`
    );
    if (
      typedError instanceof TypeError &&
      typedError.message.toLowerCase().includes('fetch failed')
    ) {
      console.warn(
        `[FETCH FAILED] Could not connect to the backend API for deleteCourse at ${url}.`
      );
    }
    throw error;
  }
}

// --- Schedule Management ---
export async function getScheduledEntries(): Promise<ScheduleEntry[]> {
  const url = `${API_BASE_URL}/schedules`;

  try {
    const response = await fetch(url);

    console.log(response);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch schedule entries: ${response.statusText} (status: ${response.status})`
      );
    }

    const entries = await response.json();

    return entries.map((entry: any) => ({
      id: entry.id.toString(),
      courseId: entry.course?.id?.toString() || '',
      instructorId: entry.instructor?.id?.toString() || '',
      taId: entry.ta?.id?.toString() || null,
      roomId: entry.room?.id?.toString() || '',
      timeSlotId: entry.timeslot?.id?.toString() || '',
      section: '',
    }));
  } catch (error) {
    const typedError = error as Error;
    if (
      typedError instanceof TypeError &&
      typedError.message.toLowerCase().includes('fetch failed')
    ) {
      console.warn(
        `[FETCH FAILED] Could not connect to the backend API for getScheduledEntries at ${url}. ` +
          `API_BASE_URL is: ${API_BASE_URL}. Details: ${typedError.message}`
      );
    } else {
      console.warn(
        `Error in getScheduledEntries when fetching from ${url}: ${typedError.message}`
      );
    }
    return [];
  }
}

export async function getFullScheduledEntries(): Promise<FullScheduleEntry[]> {
  const url = `${API_BASE_URL_ROUTING}api/schedules`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch schedules: ${response.statusText} (status: ${response.status})`
      );
    }

    const apiEntries = await response.json();

    if (!Array.isArray(apiEntries)) {
      console.warn(
        `[DATA WARNING] Fetched schedules data from ${url} is not an array:`,
        apiEntries
      );
      return [];
    }

    return apiEntries.map((entry: any) => ({
      id: entry.id?.toString() || '',
      section: '',
      course: entry.course || null,
      instructor: entry.instructor || null,
      ta: entry.ta || null,
      room: entry.room || null,
      timeSlot: entry.timeslot
        ? {
            id: entry.timeslot.id?.toString() || '',
            day: entry.timeslot.day,
            startTime: entry.timeslot.startTime,
            endTime: entry.timeslot.endTime,
          }
        : null,

      courseId: entry.course?.id?.toString() || null,
      instructorId: entry.instructor?.id?.toString() || null,
      taId: entry.ta?.id?.toString() || null,
      roomId: entry.room?.id?.toString() || null,
      timeSlotId: entry.timeslot?.id?.toString() || null,
    })) as FullScheduleEntry[];
  } catch (error) {
    const typedError = error as Error;
    console.error('Error processing full schedule entries:', typedError);
    return [];
  }
}

export async function addScheduleEntry(
  entry: Omit<ScheduleEntry, 'id'>
): Promise<ScheduleEntry> {
  // FIX: do NOT call Amplify/Next internal /api route.
  // Call Spring Boot via ALB.
  const url = `${API_BASE_URL_ROUTING}api/schedules`;

  try {
    const apiEntry = {
      course: entry.courseId ? { id: parseInt(entry.courseId) } : null,
      instructor: entry.instructorId ? { id: parseInt(entry.instructorId) } : null,
      ta: entry.taId ? { id: parseInt(entry.taId) } : null,
      room: { id: parseInt(entry.roomId) },
      timeslot: { id: parseInt(entry.timeSlotId) },
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(apiEntry),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to add schedule entry: ${response.statusText}`
      );
    }

    const createdEntry = await response.json();

    return {
      id: createdEntry.id.toString(),
      courseId: createdEntry.course?.id?.toString() || '',
      instructorId: createdEntry.instructor?.id?.toString() || '',
      taId: createdEntry.ta?.id?.toString() || null,
      roomId: createdEntry.room?.id?.toString() || '',
      timeSlotId: createdEntry.timeslot?.id?.toString() || '',
      section: '',
    };
  } catch (error) {
    const typedError = error as Error;
    console.error(`Error in addScheduleEntry when posting to ${url}: ${typedError.message}`);
    throw error;
  }
}

// --- Instructor Management ---
export async function getInstructors(): Promise<Instructor[]> {
  const url = `${API_BASE_URL}/instructor/?departmentName=ARTIFICIAL_INTELLIGENCE`;

  try {
    const response = await fetch(url);
    console.log(response);

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Could not read error response body');
      console.warn(
        `[API ERROR] Failed to fetch instructors from ${url}. Status: ${response.status} ${response.statusText}. Response: ${errorText}`
      );
      throw new Error(
        `Failed to fetch instructors: ${response.statusText} (status: ${response.status})`
      );
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const responseText = await response.text().catch(() => 'Could not read non-JSON response body');
      console.warn(
        `[DATA WARNING] Expected JSON, but received ${contentType} from ${url}. Response: ${responseText}`
      );
      return [];
    }

    const rawData = await response.json();

    if (!Array.isArray(rawData)) {
      console.warn(`[DATA WARNING] Fetched instructors data from ${url} is not an array:`, rawData);
      return [];
    }

    const instructors: Instructor[] = rawData
      .map((item: any, index: number) => {
        if (typeof item !== 'object' || item === null) {
          console.warn(`[DATA WARNING] Instructor item at index ${index} from ${url} is not an object.`);
          return null;
        }
        const id = item.id !== undefined && item.id !== null ? String(item.id) : `missing-id-${index}`;
        const name = typeof item.name === 'string' ? item.name : `Missing Name ${index}`;
        const email = typeof item.email === 'string' ? item.email : '';
        const department = typeof item.department === 'string' ? item.department : '';
        const jobTitle = typeof item.jobTitle === 'string' ? item.jobTitle : '';
        const teachingLoad = typeof item.teachingLoad === 'number' ? item.teachingLoad : undefined;

        return { id, name, email, department, jobTitle, teachingLoad };
      })
      .filter(Boolean) as Instructor[];

    if (instructors.length !== rawData.length) {
      console.warn(`[DATA WARNING] Some instructor items from ${url} were invalid or malformed and were filtered out or defaulted.`);
    }

    return instructors;
  } catch (error) {
    const typedError = error as Error;
    const isFetchFailedError =
      typedError instanceof TypeError &&
      typedError.message.toLowerCase().includes('fetch failed');

    if (isFetchFailedError) {
      console.warn(
        `[FETCH FAILED] Could not connect to the backend API for getInstructors at ${url}. ` +
          `API_BASE_URL is: ${API_BASE_URL}. Details: ${typedError.message}`
      );
    } else {
      console.warn(
        `Error in getInstructors when fetching from ${url}: ${typedError.message}. Stack: ${typedError.stack}`
      );
    }
    return [];
  }
}

// FIXED: fetch time slots from Spring Boot directly (no /api/timeSlot)
export async function getTimeSlot(): Promise<TimeSlot[]> {
  const url = `${API_BASE_URL}/time`;

  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch time slots: ${response.status} ${response.statusText}`);
  }

  return (await response.json()) as TimeSlot[];
}

export function getInstructorById(id: string): Instructor | undefined {
  console.warn(`getInstructorById (${id}) is using in-memory data. Needs API integration.`);
  return state.instructors.find((i) => i.id === id);
}

export async function addInstructor(instructor: Omit<Instructor, 'id'>): Promise<Instructor> {
  console.warn('addInstructor is using mock/in-memory logic. Needs API integration.');
  const newInstructor: Instructor = { ...instructor, id: `inst${Date.now()}` };
  state.instructors.push(newInstructor);
  return newInstructor;
}

export async function updateInstructor(updatedInstructor: Instructor): Promise<Instructor | null> {
  console.warn('updateInstructor is using mock/in-memory logic. Needs API integration.');
  const index = state.instructors.findIndex((i) => i.id === updatedInstructor.id);
  if (index !== -1) {
    state.instructors[index] = updatedInstructor;
    return updatedInstructor;
  }
  return null;
}

export async function deleteInstructor(id: string): Promise<boolean> {
  console.warn('deleteInstructor is using mock/in-memory logic. Needs API integration.');
  const initialLength = state.instructors.length;
  state.instructors = state.instructors.filter((i) => i.id !== id);
  return state.instructors.length < initialLength;
}

// --- TA Management ---
export async function getTAs(): Promise<TA[]> {
  const url = `${API_BASE_URL_ROUTING}api/ta`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    console.log(response);

    if (!response.ok) {
      throw new Error(`Failed to fetch TAs: ${response.statusText} (status: ${response.status})`);
    }

    const tasData = await response.json();

    if (!Array.isArray(tasData)) {
      console.warn(`[DATA WARNING] Fetched TA data from ${url} is not an array:`, tasData);
      return [];
    }

    return tasData as TA[];
  } catch (error) {
    const typedError = error as Error;
    const isFetchFailedError =
      typedError instanceof TypeError &&
      typedError.message.toLowerCase().includes('fetch failed');

    if (isFetchFailedError) {
      console.warn(
        `[FETCH FAILED] Could not connect to the backend API for getTAs at ${url}. ` +
          `Please ensure your backend server is running and accessible. ` +
          `API_BASE_URL_ROUTING is: ${API_BASE_URL_ROUTING}. Details: ${typedError.message}`
      );
    } else {
      console.warn(`Error in getTAs when fetching from ${url}: ${typedError.message}`);
    }

    return [];
  }
}

export function getTARById(id: string): TA | undefined {
  console.warn(`getTARById (${id}) is using in-memory data. Needs API integration.`);
  return state.tas.find((t) => t.id === id);
}

// --- Room Management ---
export function getRooms(): Room[] {
  console.warn('getRooms is using in-memory data. Needs API integration.');
  return [...state.rooms];
}

export function getRoomById(id: string): Room | undefined {
  console.warn(`getRoomById (${id}) is using in-memory data. Needs API integration.`);
  return state.rooms.find((r) => r.id === id);
}

// --- TimeSlot Management (mock/in-memory) ---
export function getTimeSlots(): TimeSlot[] {
  console.warn('getTimeSlots is using in-memory data. Needs API integration.');
  return [...state.timeSlots].sort((a, b) => {
    const dayOrder = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    if (dayOrder.indexOf(a.day) !== dayOrder.indexOf(b.day)) {
      return dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
    }
    return a.startTime.localeCompare(b.startTime);
  });
}

export function getTimeSlotById(id: string): TimeSlot | undefined {
  console.warn(`getTimeSlotById (${id}) is using in-memory data. Needs API integration.`);
  return state.timeSlots.find((ts) => ts.id === id);
}
