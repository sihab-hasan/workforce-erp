import { useState } from "react";
import { ArrowLeft, Briefcase, Building2, Clock, Edit, FileText, Shield } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@workforce-erp/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workforce-erp/ui/components/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workforce-erp/ui/components/tabs";
import { ErpPage, StatCard, StatusPill } from "#components/erp/ErpPage";
import { companyRoutes } from "#routes/paths";

export default function EmployeeDetailsPage() {
  const { tenantKey = "", companyKey = "", id = "EMP-001" } = useParams();
  const [activeTab, setActiveTab] = useState("overview");

  // In production, this resolves from useEmployeeDetail(id)
  const employee = {
    id,
    name: "Jane Cooper",
    initials: "JC",
    title: "Regional Sales Manager",
    department: "Sales & Marketing",
    employmentType: "full-time" as const,
    status: "active" as const,
    manager: "Devon Lane",
    location: "Dhaka HQ",
    hireDate: "2024-03-15",
    email: "jane.cooper@company.com",
    phone: "+880 1711 223344",
    employee_code: "EMP-2024-042",
    national_id: "NID-8849204921",
    blood_group: "O+",
  };

  const backUrl = companyRoutes.employees(tenantKey, companyKey);

  return (
    <ErpPage
      title={employee.name}
      description={`${employee.title} · ${employee.department} (${employee.employee_code})`}
      actions={
        <>
          <Button variant="outline" nativeButton={false} render={<Link to={backUrl} />}>
            <ArrowLeft />
            Back to directory
          </Button>
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link to={companyRoutes.employeeEdit(tenantKey, companyKey, employee.id)} />}
          >
            <Edit />
            Edit profile
          </Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Employment status" value={<StatusPill value={employee.status} />} />
        <StatCard
          label="Department"
          value={<span className="text-base font-semibold">{employee.department}</span>}
        />
        <StatCard
          label="Reporting manager"
          value={<span className="text-base font-semibold">{employee.manager}</span>}
        />
        <StatCard
          label="Work location"
          value={<span className="text-base font-semibold">{employee.location}</span>}
        />
      </div>

      {/* Tabs Layout */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-4">
        <TabsList className="grid w-full grid-cols-4 max-w-md">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="employment">Job & Terms</TabsTrigger>
          <TabsTrigger value="timesheets">Timesheets</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        {/* Tab 1: Overview */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Building2 className="size-4 text-primary" />
                  Workplace Assignment
                </CardTitle>
                <CardDescription>Department, reporting hierarchy, and location</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Department</span>
                  <span className="font-medium text-foreground">{employee.department}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Office Location</span>
                  <span className="font-medium text-foreground">{employee.location}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Reporting Manager</span>
                  <span className="font-medium text-foreground">{employee.manager}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Contract Type</span>
                  <span className="font-medium text-foreground capitalize">
                    {employee.employmentType.replace("-", " ")}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="size-4 text-primary" />
                  Personal Information
                </CardTitle>
                <CardDescription>Verified identity and emergency attributes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Work Email</span>
                  <span className="font-medium text-foreground">{employee.email}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Contact Phone</span>
                  <span className="font-medium text-foreground">{employee.phone}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Identification</span>
                  <span className="font-medium font-mono text-foreground">
                    {employee.national_id}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Blood Group</span>
                  <span className="font-medium text-foreground">{employee.blood_group}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab 2: Job & Terms */}
        <TabsContent value="employment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Briefcase className="size-4 text-primary" />
                Employment Terms
              </CardTitle>
              <CardDescription>Contract details, work schedule, and status history</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Employment Agreement</p>
                  <p className="mt-1 font-semibold text-foreground capitalize">
                    {employee.employmentType.replace("-", " ")} Regular
                  </p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Standard Work Hours</p>
                  <p className="mt-1 font-semibold text-foreground">40 hrs / week (8h daily)</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Probation Status</p>
                  <p className="mt-1 font-semibold text-primary">Completed</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Leave Entitlement</p>
                  <p className="mt-1 font-semibold text-foreground">
                    18 Days Annual + 10 Days Sick
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Timesheets */}
        <TabsContent value="timesheets" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="size-4 text-primary" />
                Recent Timesheet Logs
              </CardTitle>
              <CardDescription>Verified attendance timestamps and shift summaries</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border divide-y text-sm">
                <div className="flex items-center justify-between p-3">
                  <div>
                    <p className="font-medium">Today · Shift Log</p>
                    <p className="text-xs text-muted-foreground">09:00 AM – In Progress</p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                    Active Clock
                  </span>
                </div>
                <div className="flex items-center justify-between p-3">
                  <div>
                    <p className="font-medium">Yesterday · Regular Day</p>
                    <p className="text-xs text-muted-foreground">09:02 AM – 05:30 PM (8h 28m)</p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                    Verified
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Documents */}
        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="size-4 text-primary" />
                Employee Files & Compliance
              </CardTitle>
              <CardDescription>
                Signed contracts, identity documents, and certifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <FileText className="size-5 text-primary" />
                    <div>
                      <p className="font-medium text-sm">Employment_Agreement.pdf</p>
                      <p className="text-xs text-muted-foreground">Signed March 2024 · 2.4 MB</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <FileText className="size-5 text-primary" />
                    <div>
                      <p className="font-medium text-sm">National_ID_Verified.pdf</p>
                      <p className="text-xs text-muted-foreground">Identity doc · 1.1 MB</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </ErpPage>
  );
}
