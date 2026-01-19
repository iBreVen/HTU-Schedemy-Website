import type { Course, ScheduleEntry, FullScheduleEntry, Instructor, TA, Room, TimeSlot } from './types';
import {
  instructors as initialInstructorsData,
  tas as initialTAs,
  rooms as initialRooms,
  timeSlots as initialTimeSlots,
  instructors as mockInitialInstructors,
  tas as mockInitialTAs, tas
} from './data';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://https://api.ayoub.htufolio.com:8080';
const API_BASE_URL_ROUTING = 'https://master.d2hh6o27ll1srl.amplifyapp.com/';
// const API_BASE_URL_ROUTING = 'http://localhost:3001/';

interface AppState {
  // Data fetched via API is not stored in this client-side state by default.
  // This state is for mock data or client-side only data.
  instructors: Instructor[]; // Kept for getInstructorById which is currently mock
  tas: TA[]; // Kept for getTARById which is currently mock
  rooms: Room[];
  timeSlots: TimeSlot[];
  scheduleEntries: ScheduleEntry[];
}

// Initialize state with mock data
const state: AppState = {
  instructors: [...mockInitialInstructors], // Populated for synchronous getters like getInstructorById
  tas: [...mockInitialTAs], // Populated for synchronous getters like getTARById
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
  const url = `${API_BASE_URL_ROUTING}api/course`;
  console.log(getBaseUrl())
  try {

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch courses: ${response.statusText} (status: ${response.status})`);
    }
    const coursesData = await response.json();

    if (!Array.isArray(coursesData)) {
      console.warn(`[DATA WARNING] Fetched courses data from ${url} is not an array:`, coursesData);
      return []; // Return empty array if data is not an array
    }
    // Add a check for object properties if needed, for now, we trust the structure if it's an array
    return coursesData as Course[];
  } catch (error) {
    const typedError = error as Error;
    const isFetchFailedError = typedError instanceof TypeError && typedError.message.toLowerCase().includes('fetch failed');

    if (isFetchFailedError) {
        console.warn(`[FETCH FAILED] Could not connect to the backend API for getCourses at ${url}. ` +
                     `Please ensure your backend server is running and accessible. ` +
                     `API_BASE_URL is: ${API_BASE_URL}. Details: ${typedError.message}`);
    } else {
        console.warn(`Error in getCourses when fetching from ${url}: ${typedError.message}`);
    }
    return []; 
  }
}

export async function getCourseById(id: string): Promise<Course | undefined> {
  const url = `${API_BASE_URL}/courses/${id}`;
  try {
    const response = await fetch(url); 
    if (!response.ok) {
      if (response.status === 404) return undefined;
      throw new Error(`Failed to fetch course ${id}: ${response.statusText} (status: ${response.status})`);
    }
    return await response.json();
  } catch (error) {
    const typedError = error as Error;
    const isFetchFailedError = typedError instanceof TypeError && typedError.message.toLowerCase().includes('fetch failed');
    
    if (isFetchFailedError) {
        console.warn(`[FETCH FAILED] Could not connect to the backend API for getCourseById at ${url}. ` +
                     `Details: ${typedError.message}`);
    } else {
        console.warn(`Error fetching course ${id} from ${url}: ${typedError.message}`);
    }
    return undefined;
  }
}


export async function addCourse(course: Omit<Course, 'id'>): Promise<Course> {
  const url = `${API_BASE_URL}/courses`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(course),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to add course and parse error response' }));
      throw new Error(errorData.details || errorData.error || `Failed to add course: ${response.statusText} (status: ${response.status})`);
    }
    return await response.json();
  } catch (error) {
    const typedError = error as Error;
    console.error(`Error in addCourse when posting to ${url}: ${typedError.message}`);
    if (typedError instanceof TypeError && typedError.message.toLowerCase().includes('fetch failed')) {
        console.warn(`[FETCH FAILED] Could not connect to the backend API for addCourse at ${url}.`);
    }
    throw error; 
  }
}

export async function updateCourse(updatedCourse: Course): Promise<Course | null> {
  const url = `${API_BASE_URL}/courses/${updatedCourse.id}`;
  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedCourse),
    });
    if (!response.ok) {
       const errorData = await response.json().catch(() => ({ error: 'Failed to update course and parse error response' }));
      throw new Error(errorData.details || errorData.error || `Failed to update course: ${response.statusText} (status: ${response.status})`);
    }
    return await response.json();
  } catch (error) {
    const typedError = error as Error;
    console.error(`Error in updateCourse when putting to ${url}: ${typedError.message}`);
     if (typedError instanceof TypeError && typedError.message.toLowerCase().includes('fetch failed')) {
        console.warn(`[FETCH FAILED] Could not connect to the backend API for updateCourse at ${url}.`);
    }
    throw error; 
  }
}

export async function deleteCourse(id: string): Promise<boolean> {
  const url = `${API_BASE_URL}/courses/${id}`;
  try {
    const response = await fetch(url, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to delete course and parse error response' }));
      throw new Error(errorData.details || errorData.error || `Failed to delete course: ${response.statusText} (status: ${response.status})`);
    }
    return true; 
  } catch (error) {
    const typedError = error as Error;
    console.error(`Error in deleteCourse when deleting ${url}: ${typedError.message}`);
    if (typedError instanceof TypeError && typedError.message.toLowerCase().includes('fetch failed')) {
        console.warn(`[FETCH FAILED] Could not connect to the backend API for deleteCourse at ${url}.`);
    }
    throw error; 
  }
}

// --- Instructor Management (In-memory for now) ---
// export async function getInstructors(): Promise<Instructor[]> {
//   // TODO: Replace with API call when backend is ready
//   console.warn("getInstructors is using in-memory mock data. Needs API integration.");
//   return new Promise((resolve) => resolve([...state.instructors]));
// }

// export async function getInstructorById(id: string): Promise<Instructor | undefined> {
//   // TODO: Replace with API call
//   console.warn("getInstructorById is using in-memory mock data. Needs API integration.");
//   return new Promise((resolve) => resolve(state.instructors.find(i => i.id === id)));
// }

// export async function addInstructor(instructorData: Omit<Instructor, 'id'>): Promise<Instructor> {
//   // TODO: Replace with API call
//   console.warn("addInstructor is using in-memory mock data. Needs API integration.");
//   const newInstructor: Instructor = { ...instructorData, id: `inst${Date.now()}` };
//   state.instructors.push(newInstructor);
//   return new Promise((resolve) => resolve(newInstructor));
// }

// export async function updateInstructor(updatedInstructorData: Instructor): Promise<Instructor | null> {
//   // TODO: Replace with API call
//   console.warn("updateInstructor is using in-memory mock data. Needs API integration.");
//   const index = state.instructors.findIndex(i => i.id === updatedInstructorData.id);
//   if (index !== -1) {
//     state.instructors[index] = updatedInstructorData;
//     return new Promise((resolve) => resolve(updatedInstructorData));
//   }
//   return new Promise((resolve) => resolve(null));
// }

// export async function deleteInstructor(id: string): Promise<boolean> {
//   // TODO: Replace with API call
//   console.warn("deleteInstructor is using in-memory mock data. Needs API integration.");
//   const initialLength = state.instructors.length;
//   state.instructors = state.instructors.filter(i => i.id !== id);
//   return new Promise((resolve) => resolve(state.instructors.length < initialLength));
// }
export async function getScheduledEntries(): Promise<ScheduleEntry[]> {
  const url = `${API_BASE_URL}/schedules`;
  try {
    const response = await fetch(url);

    console.log(response)
    if (!response.ok) {
      throw new Error(`Failed to fetch schedule entries: ${response.statusText} (status: ${response.status})`);
    }
    const entries = await response.json();
    
    // Transform the API response into ScheduleEntry format if needed
    return entries.map((entry: any) => ({
      id: entry.id.toString(),
      courseId: entry.course?.id?.toString() || '',
      instructorId: entry.instructor?.id?.toString() || '',
      taId: entry.ta?.id?.toString() || null,
      roomId: entry.room?.id?.toString() || '',
      timeSlotId: entry.timeslot?.id?.toString() || '',
      section: '', // Add section if available in the response
    }));
  } catch (error) {
    const typedError = error as Error;
    if (typedError instanceof TypeError && typedError.message.toLowerCase().includes('fetch failed')) {
      console.warn(`[FETCH FAILED] Could not connect to the backend API for getScheduledEntries at ${url}. ` +
                   `API_BASE_URL is: ${API_BASE_URL}. Details: ${typedError.message}`);
    } else {
      console.warn(`Error in getScheduledEntries when fetching from ${url}: ${typedError.message}`);
    }
    return [];
  }
}
export async function getFullScheduledEntries(): Promise<FullScheduleEntry[]> {
  const url = `${API_BASE_URL_ROUTING}api/schedules`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });



    if (!response.ok) {
      throw new Error(`Failed to fetch schedules: ${response.statusText} (status: ${response.status})`);
    }

    const apiEntries = await response.json();

    if (!Array.isArray(apiEntries)) {
      console.warn(`[DATA WARNING] Fetched schedules data from ${url} is not an array:`, apiEntries);
      return [];
    }

    return apiEntries.map((entry: any) => ({
      id: entry.id?.toString() || '',
      section: '',
      course: entry.course || null,
      instructor: entry.instructor || null,
      ta: entry.ta || null,
      room: entry.room || null,
      timeSlot: entry.timeslot ? {
        id: entry.timeslot.id?.toString() || '',
        day: entry.timeslot.day,
        startTime: entry.timeslot.startTime,
        endTime: entry.timeslot.endTime
      } : null,

      // Explicit IDs for initialization in EditableScheduledClassesTable
      courseId: entry.course?.id?.toString() || null,
      instructorId: entry.instructor?.id?.toString() || null,
      taId: entry.ta?.id?.toString() || null,
      roomId: entry.room?.id?.toString() || null,
      timeSlotId: entry.timeslot?.id?.toString() || null,
    })) as FullScheduleEntry[];

  } catch (error) {
    const typedError = error as Error;
    console.error("Error processing full schedule entries:", typedError);
    return [];
  }
}




// // --- Schedule Management (Needs to be updated to use API calls for entries) ---
// export function getScheduledEntries(): ScheduleEntry[] {
//   // TODO: Fetch from backend API
//   console.warn("getScheduledEntries is using in-memory data. Needs API integration.");
//   return [...state.scheduleEntries];
// }

// export async function getFullScheduledEntries(): Promise<FullScheduleEntry[]> {
//   console.warn("getFullScheduledEntries is using in-memory data for scheduled entries and related entities. Needs API integration.");
//   const currentScheduleEntries = getScheduledEntries(); 
  
//   const fullEntriesPromises = currentScheduleEntries.map(async (entry) => {
//     const course = await getCourseById(entry.courseId); 
//     const instructor = await getInstructorById(entry.instructorId); 
//     const ta = entry.taId ? await getTARById(entry.taId) : undefined;  
//     const room = await getRoomById(entry.roomId); 
//     const timeSlot = await getTimeSlotById(entry.timeSlotId); 

//     if (!course || !instructor || !room || !timeSlot) {
//       console.error("Data inconsistency for schedule entry:", entry, {course, instructor, room, timeSlot});
//       return null;
//     }
    
//     return {
//       id: entry.id,
//       section: entry.section,
//       course,
//       instructor,
//       ta,
//       room,
//       timeSlot,
//     };
//   });

//   try {
//     const resolvedEntries = await Promise.all(fullEntriesPromises);
//     return resolvedEntries.filter(entry => entry !== null) as FullScheduleEntry[];
//   } catch (error) {
//     console.error("Error processing full schedule entries:", error);
//     return []; 
//   }
// }


export async function addScheduleEntry(entry: Omit<ScheduleEntry, 'id'>): Promise<ScheduleEntry> {
  const url = '/api/schedules'; // Call internal API route
  try {
    const apiEntry = {
      course: entry.courseId ? { id: parseInt(entry.courseId) } : null,
      instructor: entry.instructorId ? { id: parseInt(entry.instructorId) } : null,
      ta: entry.taId ? { id: parseInt(entry.taId) } : null,
      room: { id: parseInt(entry.roomId) },
      timeslot: { id: parseInt(entry.timeSlotId) }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(apiEntry),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to add schedule entry: ${response.statusText}`);
    }

    const createdEntry = await response.json();

    return {
      id: createdEntry.id.toString(),
      courseId: createdEntry.course?.id?.toString() || '',
      instructorId: createdEntry.instructor?.id?.toString() || '',
      taId: createdEntry.ta?.id?.toString() || null,
      roomId: createdEntry.room?.id?.toString() || '',
      timeSlotId: createdEntry.timeslot?.id?.toString() || '',
      section: '' // Optional: populate from API if provided
    };
  } catch (error) {
    const typedError = error as Error;
    console.error(`Error in addScheduleEntry when posting to ${url}: ${typedError.message}`);
    throw error;
  }
}


// export function addScheduleEntry(entry: Omit<ScheduleEntry, 'id'>): ScheduleEntry {
//   // TODO: Send to backend API
//   console.warn("addScheduleEntry is using in-memory data. Needs API integration.");
//   const newEntry: ScheduleEntry = { ...entry, id: `se${Date.now()}` };
//   state.scheduleEntries.push(newEntry);
//   return newEntry;
// }

// --- Instructor Management ---
export async function getInstructors(): Promise<Instructor[]> {
  // const url = `${API_BASE_URL}/instructor?departmentName=COMPUTER_SCIENCE`;
  const url = `${API_BASE_URL}/instructor/?departmentName=ARTIFICIAL_INTELLIGENCE`
  
  try {
    // const response = await fetch('/api/instructor');
    const response = await fetch(url);
    console.log(response)
    if (!response.ok) {
      const errorText = await response.text().catch(() => "Could not read error response body");
      console.warn(`[API ERROR] Failed to fetch instructors from ${url}. Status: ${response.status} ${response.statusText}. Response: ${errorText}`);
      throw new Error(`Failed to fetch instructors: ${response.statusText} (status: ${response.status})`);
    }

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const responseText = await response.text().catch(() => "Could not read non-JSON response body");
      console.warn(`[DATA WARNING] Expected JSON, but received ${contentType} from ${url}. Response: ${responseText}`);
      return [];
    }
    
    const rawData = await response.json();
    
    if (!Array.isArray(rawData)) {
      console.warn(`[DATA WARNING] Fetched instructors data from ${url} is not an array:`, rawData);
      return [];
    }

    const instructors: Instructor[] = rawData.map((item: any, index: number) => {
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
    }).filter(Boolean) as Instructor[];

    if (instructors.length !== rawData.length) {
        console.warn(`[DATA WARNING] Some instructor items from ${url} were invalid or malformed and were filtered out or defaulted.`);
    }
    return instructors;
  } catch (error) {
    const typedError = error as Error;
    const isFetchFailedError = typedError instanceof TypeError && typedError.message.toLowerCase().includes('fetch failed');

    if (isFetchFailedError) {
        console.warn(`[FETCH FAILED] Could not connect to the backend API for getInstructors at ${url}. ` +
                     `API_BASE_URL is: ${API_BASE_URL}. Details: ${typedError.message}`);
    } else {
        console.warn(`Error in getInstructors when fetching from ${url}: ${typedError.message}. Stack: ${typedError.stack}`);
    }
    return []; 
  }
}



export async function getTimeSlot(): Promise<TimeSlot[]> {
  const url = `${API_BASE_URL}/time`;

  try {
    const response = await fetch('/api/timeSlot', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch time slots: ${response.status} ${response.statusText}`);
    }

    const timeSlots: TimeSlot[] = await response.json();
    return timeSlots;
  } catch (error) {
    console.error('Error fetching time slots:', error);
    throw error;
  }
}

export function getInstructorById(id: string): Instructor | undefined {
  // This still uses mock data. Needs API integration if you want to fetch a single instructor.
  console.warn(`getInstructorById (${id}) is using in-memory data. Needs API integration.`);
  return state.instructors.find(i => i.id === id);
}

export async function addInstructor(instructor: Omit<Instructor, 'id'>): Promise<Instructor> {
   // TODO: Implement API call to Spring Boot backend
  console.warn("addInstructor is using mock/in-memory logic. Needs API integration.");
  // Simulating API call:
  const newInstructor: Instructor = { ...instructor, id: `inst${Date.now()}` };
  state.instructors.push(newInstructor); // Add to mock state for now
  return newInstructor; // In a real API, this would be the response from the server.
}

export async function updateInstructor(updatedInstructor: Instructor): Promise<Instructor | null> {
  // TODO: Implement API call to Spring Boot backend
  console.warn("updateInstructor is using mock/in-memory logic. Needs API integration.");
  const index = state.instructors.findIndex(i => i.id === updatedInstructor.id);
  if (index !== -1) {
    state.instructors[index] = updatedInstructor;
    return updatedInstructor;
  }
  return null;
}

export async function deleteInstructor(id: string): Promise<boolean> {
  // TODO: Implement API call to Spring Boot backend
  console.warn("deleteInstructor is using mock/in-memory logic. Needs API integration.");
  const initialLength = state.instructors.length;
  state.instructors = state.instructors.filter(i => i.id !== id);
  return state.instructors.length < initialLength;
}


// --- TA Management ---
export async function getTAs(): Promise<TA[]> {
  const url = `${API_BASE_URL_ROUTING}api/ta`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
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
  return state.tas.find(t => t.id === id);
}

// --- Room Management ---
export function getRooms(): Room[] {
  console.warn("getRooms is using in-memory data. Needs API integration.");
  return [...state.rooms];
}
export function getRoomById(id: string): Room | undefined {
  console.warn(`getRoomById (${id}) is using in-memory data. Needs API integration.`);
  return state.rooms.find(r => r.id === id);
}

// --- TimeSlot Management ---
export function getTimeSlots(): TimeSlot[] {
  console.warn("getTimeSlots is using in-memory data. Needs API integration.");
  return [...state.timeSlots].sort((a, b) => {
    const dayOrder = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    if (dayOrder.indexOf(a.day) !== dayOrder.indexOf(b.day)) {
      return dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
    }
    return a.startTime.localeCompare(b.startTime);
  });
}
export function getTimeSlotById(id: string): TimeSlot | undefined {
  console.warn(`getTimeSlotById (${id}) is using in-memory data. Needs API integration.`);
  return state.timeSlots.find(ts => ts.id === id);
}


// // --- Conflict Detection Logic (example, will need backend implementation) ---
// export fucheckForConflictsnction (entry: Omit<ScheduleEntry, 'id'>): string | null {
//   console.warn("checkForConflicts is using in-memory data. Needs API integration for reliability.");
//   const existingEntries = getScheduledEntries(); 

//   // Fetch instructor details for the new entry to get the name for comparison if needed,
//   // but for conflict, ID is primary.
//   const newEntryInstructor = getInstructorById(entry.instructorId);

//   if (existingEntries.some(e => e.instructorId === entry.instructorId && e.timeSlotId === entry.timeSlotId)) {
//     return `Instructor ${newEntryInstructor?.name || entry.instructorId} is already scheduled at this time.`;
//   }
//   if (entry.taId) {
//     const newEntryTA = getTARById(entry.taId);
//     if (existingEntries.some(e => e.taId === entry.taId && e.timeSlotId === entry.timeSlotId)) {
//       return `TA ${newEntryTA?.name || entry.taId} is already scheduled at this time.`;
//     }
//   }
//   if (existingEntries.some(e => e.roomId === entry.roomId && e.timeSlotId === entry.timeSlotId)) {
//     const conflictingRoom = getRoomById(entry.roomId);
//     return `Room ${conflictingRoom?.name || entry.roomId} is already booked at this time.`;
//   }
//   // This conflict check for course section might be too broad if sections are distinct
//   // if (existingEntries.some(e => e.courseId === entry.courseId && (e.section || '') === (entry.section || '') && e.timeSlotId === entry.timeSlotId)) {
//   //    const conflictingCourse = await getCourseById(entry.courseId); // Needs async if getCourseById is async
//   //    return `Course ${conflictingCourse?.name || entry.courseId} (Section: ${entry.section || 'N/A'}) is already scheduled at this time.`;
//   // }

//   return null;
// }

