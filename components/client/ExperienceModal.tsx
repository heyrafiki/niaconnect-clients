import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ExperienceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (experience: WorkExperience) => void;
}

export interface WorkExperience {
  organisation: string;
  position: string;
  country: string;
  city: string;
  startDate: Date;
  isCurrent: boolean;
  endDate?: Date;
}

export function ExperienceModal({
  isOpen,
  onClose,
  onSubmit,
}: ExperienceModalProps) {
  const [experience, setExperience] = useState<WorkExperience>({
    organisation: "",
    position: "",
    country: "",
    city: "",
    startDate: new Date(),
    isCurrent: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(experience);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Work Experience</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="organisation">Organisation</Label>
            <Input
              id="organisation"
              value={experience.organisation}
              onChange={(e) =>
                setExperience((prev) => ({
                  ...prev,
                  organisation: e.target.value,
                }))
              }
              placeholder="Enter organisation name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="position">Position</Label>
            <Input
              id="position"
              value={experience.position}
              onChange={(e) =>
                setExperience((prev) => ({ ...prev, position: e.target.value }))
              }
              placeholder="Enter your position"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Select
              value={experience.country}
              onValueChange={(value) =>
                setExperience((prev) => ({ ...prev, country: value }))
              }
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="kenya">Kenya</SelectItem>
                <SelectItem value="uganda">Uganda</SelectItem>
                <SelectItem value="tanzania">Tanzania</SelectItem>
                <SelectItem value="rwanda">Rwanda</SelectItem>
                <SelectItem value="ethiopia">Ethiopia</SelectItem>
                <SelectItem value="south-africa">South Africa</SelectItem>
                <SelectItem value="nigeria">Nigeria</SelectItem>
                <SelectItem value="ghana">Ghana</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={experience.city}
              onChange={(e) =>
                setExperience((prev) => ({ ...prev, city: e.target.value }))
              }
              placeholder="Enter city"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !experience.startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {experience.startDate ? (
                    format(experience.startDate, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={experience.startDate}
                  onSelect={(date) =>
                    setExperience((prev) => ({
                      ...prev,
                      startDate: date || new Date(),
                    }))
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isCurrent"
              checked={experience.isCurrent}
              onCheckedChange={(checked) =>
                setExperience((prev) => ({
                  ...prev,
                  isCurrent: checked as boolean,
                }))
              }
            />
            <Label htmlFor="isCurrent">I currently work here</Label>
          </div>

          {!experience.isCurrent && (
            <div className="space-y-2">
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !experience.endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {experience.endDate ? (
                      format(experience.endDate, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={experience.endDate}
                    onSelect={(date) =>
                      setExperience((prev) => ({ ...prev, endDate: date }))
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

          <div className="flex justify-end gap-4 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Submit</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
