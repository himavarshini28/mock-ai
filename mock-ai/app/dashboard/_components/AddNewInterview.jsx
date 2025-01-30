"use client";
import React, { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { v4 as uuid } from "uuid";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { chatSession } from "@/utils/GeminiAIModel";
import { Loader2 } from "lucide-react";
import { db } from "@/utils/db";
import { MockInterview } from "@/utils/schema";
import { useUser } from "@clerk/nextjs";
import moment from "moment";

function AddNewInterview() {
  const [openDialog, setOpenDialog] = useState(false);
  const [jobPosition, setJobPosition] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [jobExperience, setJobExperience] = useState("");
  const [loading, setLoading] = useState(false);
  const [jsonResponse, setJsonResponse] = useState([]);
  const { user } = useUser();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const InputPrompt = `Job position: ${jobPosition}, job description: ${jobDesc}, years of experience: ${jobExperience}. Based on this data, generate 5 interview questions and answers tailored to the role. Format the response as a JSON array, where each object contains a question and a corresponding answer field.`;


      const result = await chatSession.sendMessage(InputPrompt);
      const MockResponse = (result.response.text())
        .replace("```json", "")
        .replace("```", "");
      // console.log(JSON.parse(MockResponse));
      setJsonResponse(MockResponse);
      const resp= await db.insert(MockInterview).values({
            jsonMockResp:MockResponse,
            jobPosition,
            jobDesc,
            jobExperience,
            createdBy:user?.primaryEmailAddress?.emailAddress,
            createdAt:moment().format('DD-MM-YYY'),
            mockId:uuid(),
      }).returning({mockId: MockInterview.mockId});

      console.log("ID:",resp);
      setLoading(false);
  };

  return (
    <div>
      <div
        className="p-10 border rounded-lg bg-secondary hover:scale-105 hover:shadow-md transition-all"
        onClick={() => setOpenDialog(true)}
      >
        <h2 className="text-lg text-center">+ Add New</h2>
      </div>
      <Dialog open={openDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              Tell us more about your job role
            </DialogTitle>
            <DialogDescription asChild>
              <form onSubmit={onSubmit}>
                <div>
                  <h2>
                    Add Details about your job position/role, Job Description,
                    Years of Experience
                  </h2>
                  <div className="mt-7 my-3">
                    <label>Job Role/ Job Position</label>
                    <Input
                      onChange={(e) => setJobPosition(e.target.value)}
                      className="mt-1"
                      placeholder="Ex. Full Stack Developer"
                      required
                    />
                  </div>
                  <div className="my-3">
                    <label>Job Description/ Tech Stack (In Short)</label>
                    <Textarea
                      onChange={(e) => setJobDesc(e.target.value)}
                      placeholder="Ex. React, Angular, NodeJs, MySql etc"
                      required
                    />
                  </div>
                  <div className="my-3">
                    <label>Years of Experience</label>
                    <Input
                      onChange={(e) => setJobExperience(e.target.value)}
                      placeholder="Ex. 5"
                      type="number"
                      max="50"
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-6 justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setOpenDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin" /> Generating by AI
                      </>
                    ) : (
                      "Start Interview"
                    )}
                  </Button>
                </div>
              </form>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AddNewInterview;
