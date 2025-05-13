
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import Header from "@/components/Header";
import { File, Trash2, Upload } from "lucide-react";

const BoardMeetingCreate = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [meetingDate, setMeetingDate] = useState("");
  const [meetingTime, setMeetingTime] = useState("");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState<string>("upcoming");
  const [files, setFiles] = useState<File[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles([...files, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    const updatedFiles = [...files];
    updatedFiles.splice(index, 1);
    setFiles(updatedFiles);
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Byte';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)).toString());
    return Math.round(bytes / Math.pow(1024, i)) + ' ' + sizes[i];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !meetingDate || !meetingTime || !status) {
      toast.error("필수 정보를 모두 입력해주세요.");
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Combine date and time
      const combinedDateTime = new Date(`${meetingDate}T${meetingTime}`);
      
      // Insert board meeting
      const { data: meetingData, error: meetingError } = await supabase
        .from('board_meetings')
        .insert({
          title,
          content,
          meeting_date: combinedDateTime.toISOString(),
          location,
          status
        })
        .select()
        .single();
      
      if (meetingError) throw meetingError;
      
      // Upload files if any
      if (files.length > 0) {
        for (const file of files) {
          // 1. Upload file to storage
          const filePath = `${meetingData.id}/${Date.now()}_${file.name}`;
          const { error: uploadError } = await supabase.storage
            .from('board_meeting_files')
            .upload(filePath, file);
          
          if (uploadError) throw uploadError;
          
          // 2. Create file record in database
          const { error: fileRecordError } = await supabase
            .from('board_meeting_files')
            .insert({
              board_meeting_id: meetingData.id,
              file_name: file.name,
              file_type: file.type,
              file_size: file.size,
              file_path: filePath
            });
          
          if (fileRecordError) throw fileRecordError;
        }
      }
      
      toast.success("이사회가 등록되었습니다.");
      navigate(`/board-meetings/${meetingData.id}`);
    } catch (error: any) {
      toast.error("이사회 등록 중 오류가 발생했습니다: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <div className="flex-1 flex flex-col">
        <Header title="이사회 등록" subtitle="새로운 이사회를 등록합니다" />
        
        <div className="p-6 flex-1 overflow-auto">
          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
            <div className="space-y-6">
              <div>
                <Label htmlFor="title">이사회명 *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="이사회 제목을 입력하세요"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="meetingDate">날짜 *</Label>
                  <Input
                    id="meetingDate"
                    type="date"
                    value={meetingDate}
                    onChange={(e) => setMeetingDate(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="meetingTime">시간 *</Label>
                  <Input
                    id="meetingTime"
                    type="time"
                    value={meetingTime}
                    onChange={(e) => setMeetingTime(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="location">장소</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="이사회 장소를 입력하세요"
                />
              </div>
              
              <div>
                <Label htmlFor="status">상태 *</Label>
                <Select value={status} onValueChange={setStatus} required>
                  <SelectTrigger>
                    <SelectValue placeholder="상태 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upcoming">예정됨</SelectItem>
                    <SelectItem value="completed">완료됨</SelectItem>
                    <SelectItem value="cancelled">취소됨</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="content">내용</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="이사회 내용을 입력하세요"
                  rows={6}
                />
              </div>
              
              <div>
                <Label htmlFor="files">이사회 자료</Label>
                <div className="mt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('file-upload')?.click()}
                    className="w-full h-32 border-dashed flex flex-col items-center justify-center"
                  >
                    <Upload className="h-10 w-10 mb-2 text-muted-foreground" />
                    <div className="text-sm text-muted-foreground">
                      파일을 끌어다 놓거나 클릭하여 업로드하세요
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      최대 10개, 파일당 20MB
                    </div>
                  </Button>
                  <input
                    id="file-upload"
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
                
                {files.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {files.map((file, index) => (
                      <Card key={index}>
                        <CardContent className="p-3 flex justify-between items-center">
                          <div className="flex items-center">
                            <File className="h-5 w-5 mr-2 text-primary" />
                            <div>
                              <p className="text-sm font-medium truncate max-w-md">{file.name}</p>
                              <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/board-meetings')}
                  disabled={isLoading}
                >
                  취소
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "등록 중..." : "등록"}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BoardMeetingCreate;
