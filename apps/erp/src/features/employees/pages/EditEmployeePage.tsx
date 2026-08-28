import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "@workforce-erp/ui/components/button";
import { ErpPage } from "#components/erp/ErpPage";
import { EmployeeForm, type EmployeeFormData } from "../components/EmployeeForm";
import { useEmployeeOptions } from "../hooks/use-employees";
import { companyRoutes } from "#routes/paths";

export default function EditEmployeePage() {
  const navigate = useNavigate();
  const { tenantKey = "", companyKey = "", id: _id } = useParams();
  const optionsQuery = useEmployeeOptions();
  const [isPending, setIsPending] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const departments = optionsQuery.data?.data?.departments ?? [];
  const locations = optionsQuery.data?.data?.locations ?? [];

  // Simulated existing record
  const initialValues: Partial<EmployeeFormData> = {
    first_name: "Jane",
    last_name: "Cooper",
    email: "jane.cooper@company.com",
    phone: "+880 1711 223344",
    title: "Regional Sales Manager",
    department_name: "Sales & Marketing",
    location_name: "Dhaka HQ",
    employment_type: "full-time",
    status: "active",
    hire_date: "2024-03-15",
  };

  const handleUpdate = async (_values: EmployeeFormData) => {
    setIsPending(true);
    setServerError(null);
    try {
      setTimeout(() => {
        if (tenantKey && companyKey) {
          navigate(companyRoutes.employees(tenantKey, companyKey));
        } else {
          navigate(-1);
        }
      }, 500);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Failed to update employee profile.");
      setIsPending(false);
    }
  };

  const backUrl = tenantKey && companyKey ? companyRoutes.employees(tenantKey, companyKey) : "..";

  return (
    <ErpPage
      title="Edit employee"
      description="Modify worker profile, adjust organizational unit, or update employment parameters."
      actions={
        <Button variant="outline" nativeButton={false} render={<Link to={backUrl} />}>
          <ArrowLeft />
          Back to directory
        </Button>
      }
    >
      <div className="mx-auto max-w-4xl">
        <EmployeeForm
          initialValues={initialValues}
          departments={departments}
          locations={locations}
          isPending={isPending}
          serverError={serverError}
          onSubmit={handleUpdate}
          onCancel={() => navigate(backUrl)}
          submitLabel="Save Changes"
        />
      </div>
    </ErpPage>
  );
}
