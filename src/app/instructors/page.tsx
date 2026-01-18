'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Instructor } from '@/lib/types';

const defaultFormData = {
  email: '',
  name: '',
  jobTitle: '',
  department: '',
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.ayoub.htufolio.com';

function apiUrl(path: string) {
  return `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`;
}

export default function InstructorsPage() {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState(defaultFormData);
  const [isLoadingEmailAll, setIsLoadingEmailAll] = useState(false);
  const [loadingEmailIds, setLoadingEmailIds] = useState<Set<string | number>>(new Set());

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(apiUrl('/instructor'));
        if (!res.ok) {
          console.error('Failed to fetch instructors:', res.status, res.statusText);
          throw new Error(`Failed to fetch instructors. Status: ${res.status}`);
        }
        const data = await res.json();
        setInstructors(data);
      } catch (err) {
        console.error('Error fetching instructors:', err);
      }
    }

    fetchData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddInstructor = async () => {
    const newInstructorFromForm: Omit<Instructor, 'id' | 'teachingLoad'> = {
      ...formData,
    };

    try {
      const response = await fetch(apiUrl('/instructor'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newInstructorFromForm),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: `Failed to add instructor. Status: ${response.status}`,
        }));
        console.error('Error adding instructor:', errorData.message || response.statusText);
        return;
      }

      const addedInstructor: Instructor = await response.json();
      setInstructors((prev) => [...prev, addedInstructor]);
      setFormData(defaultFormData);
      setShowDialog(false);
    } catch (error) {
      console.error('Error submitting new instructor:', error);
    }
  };

  const handleSendEmailToAll = async () => {
    if (instructors.length === 0) return;

    setIsLoadingEmailAll(true);
    const allInstructorIds = instructors.map((instructor) => instructor.id);

    try {
      const response = await fetch(apiUrl('/email'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(allInstructorIds),
      });

      if (!response.ok) {
        console.error('Failed to send email to all instructors:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error sending email to all instructors:', error);
    } finally {
      setIsLoadingEmailAll(false);
    }
  };

  const handleSendEmailToInstructor = async (instructorId: string | number) => {
    setLoadingEmailIds((prev) => new Set(prev.add(instructorId)));

    try {
      const response = await fetch(apiUrl('/email'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([instructorId]),
      });

      if (!response.ok) {
        console.error(`Failed to send email to instructor ${instructorId}:`, response.status, response.statusText);
      }
    } catch (error) {
      console.error(`Error sending email to instructor ${instructorId}:`, error);
    } finally {
      setLoadingEmailIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(instructorId);
        return newSet;
      });
    }
  };

  return (
    <div>
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>Manage Instructors</CardTitle>
          <Button
            onClick={handleSendEmailToAll}
            disabled={isLoadingEmailAll || instructors.length === 0}
          >
            {isLoadingEmailAll ? 'Sending...' : 'Send Email For All'}
          </Button>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Job Title</TableHead>
                <TableHead>Teaching Load</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {instructors.map((instructor) => (
                <TableRow key={instructor.id}>
                  <TableCell className="font-medium">{instructor.name}</TableCell>
                  <TableCell>{instructor.email}</TableCell>
                  <TableCell>{instructor.department}</TableCell>
                  <TableCell>{instructor.jobTitle}</TableCell>
                  <TableCell>{instructor.teachingLoad ?? 'N/A'}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mr-2 hover:text-accent-foreground disabled:opacity-50"
                      onClick={() => handleSendEmailToInstructor(instructor.id)}
                      disabled={loadingEmailIds.has(instructor.id)}
                    >
                      {loadingEmailIds.has(instructor.id) ? 'Sending...' : 'Send Email'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Instructor</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAddInstructor();
                }}
                className="space-y-4"
              >
                <input
                  type="text"
                  name="name"
                  placeholder="Name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full border p-2 rounded"
                  required
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full border p-2 rounded"
                  required
                />
                <input
                  type="text"
                  name="department"
                  placeholder="Department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className="w-full border p-2 rounded"
                  required
                />
                <input
                  type="text"
                  name="jobTitle"
                  placeholder="Job Title"
                  value={formData.jobTitle}
                  onChange={handleInputChange}
                  className="w-full border p-2 rounded"
                  required
                />
                <Button type="submit">Add Instructor</Button>
              </form>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
