<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class EmployeesController extends Controller
{
    private $mockEmployees = [
        [
            "id" => "EMP-001",
            "name" => "Sarah Mitchell",
            "initials" => "SM",
            "title" => "Senior Software Engineer",
            "department" => "Engineering",
            "employmentType" => "full-time",
            "status" => "active",
            "manager" => "Daniel Park",
            "location" => "New York",
            "hireDate" => "2021-03-15",
            "email" => "sarah.mitchell@company.com",
        ],
        [
            "id" => "EMP-002",
            "name" => "James Okonkwo",
            "initials" => "JO",
            "title" => "Product Manager",
            "department" => "Product",
            "employmentType" => "full-time",
            "status" => "active",
            "manager" => "Leila Nasser",
            "location" => "London",
            "hireDate" => "2020-07-01",
            "email" => "james.okonkwo@company.com",
        ],
        [
            "id" => "EMP-003",
            "name" => "Priya Sharma",
            "initials" => "PS",
            "title" => "UX Designer",
            "department" => "Design",
            "employmentType" => "full-time",
            "status" => "on-leave",
            "manager" => "Carlos Mendez",
            "location" => "Toronto",
            "hireDate" => "2022-01-10",
            "email" => "priya.sharma@company.com",
        ],
        [
            "id" => "EMP-004",
            "name" => "Carlos Mendez",
            "initials" => "CM",
            "title" => "Design Lead",
            "department" => "Design",
            "employmentType" => "full-time",
            "status" => "active",
            "manager" => "Leila Nasser",
            "location" => "Toronto",
            "hireDate" => "2019-09-20",
            "email" => "carlos.mendez@company.com",
        ],
        [
            "id" => "EMP-005",
            "name" => "Lena Fischer",
            "initials" => "LF",
            "title" => "HR Business Partner",
            "department" => "HR & Admin",
            "employmentType" => "full-time",
            "status" => "probation",
            "manager" => "Sophie Laurent",
            "location" => "Berlin",
            "hireDate" => "2026-04-01",
            "email" => "lena.fischer@company.com",
        ],
        [
            "id" => "EMP-006",
            "name" => "Kwame Asante",
            "initials" => "KA",
            "title" => "Data Analyst",
            "department" => "Operations",
            "employmentType" => "full-time",
            "status" => "active",
            "manager" => "Daniel Park",
            "location" => "Accra",
            "hireDate" => "2023-02-14",
            "email" => "kwame.asante@company.com",
        ],
        [
            "id" => "EMP-007",
            "name" => "Mei Lin",
            "initials" => "ML",
            "title" => "DevOps Engineer",
            "department" => "Engineering",
            "employmentType" => "full-time",
            "status" => "active",
            "manager" => "Daniel Park",
            "location" => "Singapore",
            "hireDate" => "2021-11-03",
            "email" => "mei.lin@company.com",
        ],
        [
            "id" => "EMP-008",
            "name" => "Arjun Verma",
            "initials" => "AV",
            "title" => "Finance Analyst",
            "department" => "Finance",
            "employmentType" => "full-time",
            "status" => "active",
            "manager" => "Sophie Laurent",
            "location" => "Mumbai",
            "hireDate" => "2022-06-20",
            "email" => "arjun.verma@company.com",
        ],
        [
            "id" => "EMP-009",
            "name" => "Sophie Laurent",
            "initials" => "SL",
            "title" => "Chief Financial Officer",
            "department" => "Finance",
            "employmentType" => "full-time",
            "status" => "active",
            "manager" => "—",
            "location" => "Paris",
            "hireDate" => "2018-01-15",
            "email" => "sophie.laurent@company.com",
        ],
        [
            "id" => "EMP-010",
            "name" => "Marcus Thompson",
            "initials" => "MT",
            "title" => "Sales Executive",
            "department" => "Sales",
            "employmentType" => "full-time",
            "status" => "active",
            "manager" => "Leila Nasser",
            "location" => "Chicago",
            "hireDate" => "2023-09-05",
            "email" => "marcus.thompson@company.com",
        ],
        [
            "id" => "EMP-011",
            "name" => "Aiko Tanaka",
            "initials" => "AT",
            "title" => "Marketing Specialist",
            "department" => "Marketing",
            "employmentType" => "part-time",
            "status" => "active",
            "manager" => "Leila Nasser",
            "location" => "Tokyo",
            "hireDate" => "2024-01-08",
            "email" => "aiko.tanaka@company.com",
        ],
        [
            "id" => "EMP-012",
            "name" => "Daniel Park",
            "initials" => "DP",
            "title" => "VP of Engineering",
            "department" => "Engineering",
            "employmentType" => "full-time",
            "status" => "active",
            "manager" => "—",
            "location" => "Seoul",
            "hireDate" => "2017-05-22",
            "email" => "daniel.park@company.com",
        ],
        [
            "id" => "EMP-013",
            "name" => "Fatima Al-Rashid",
            "initials" => "FA",
            "title" => "Backend Engineer",
            "department" => "Engineering",
            "employmentType" => "contractor",
            "status" => "active",
            "manager" => "Daniel Park",
            "location" => "Dubai",
            "hireDate" => "2025-03-01",
            "email" => "fatima.alrashid@company.com",
        ],
        [
            "id" => "EMP-014",
            "name" => "Leila Nasser",
            "initials" => "LN",
            "title" => "Chief Operating Officer",
            "department" => "Operations",
            "employmentType" => "full-time",
            "status" => "active",
            "manager" => "—",
            "location" => "Cairo",
            "hireDate" => "2016-08-10",
            "email" => "leila.nasser@company.com",
        ],
        [
            "id" => "EMP-015",
            "name" => "Noah Williams",
            "initials" => "NW",
            "title" => "QA Engineer",
            "department" => "Engineering",
            "employmentType" => "intern",
            "status" => "probation",
            "manager" => "Daniel Park",
            "location" => "Austin",
            "hireDate" => "2026-06-01",
            "email" => "noah.williams@company.com",
        ],
        [
            "id" => "EMP-016",
            "name" => "Chiara Romano",
            "initials" => "CR",
            "title" => "Operations Analyst",
            "department" => "Operations",
            "employmentType" => "full-time",
            "status" => "inactive",
            "manager" => "Leila Nasser",
            "location" => "Milan",
            "hireDate" => "2020-03-22",
            "email" => "chiara.romano@company.com",
        ],
        [
            "id" => "EMP-017",
            "name" => "Ravi Kapoor",
            "initials" => "RK",
            "title" => "Frontend Engineer",
            "department" => "Engineering",
            "employmentType" => "full-time",
            "status" => "active",
            "manager" => "Daniel Park",
            "location" => "Bengaluru",
            "hireDate" => "2022-10-17",
            "email" => "ravi.kapoor@company.com",
        ],
        [
            "id" => "EMP-018",
            "name" => "Amara Diallo",
            "initials" => "AD",
            "title" => "Recruiter",
            "department" => "HR & Admin",
            "employmentType" => "full-time",
            "status" => "active",
            "manager" => "Sophie Laurent",
            "location" => "Dakar",
            "hireDate" => "2023-04-03",
            "email" => "amara.diallo@company.com",
        ],
    ];

    public function index(Request $request)
    {
        $search = $request->input('search');
        $department = $request->input('department', 'all');
        $status = $request->input('status', 'all');
        $location = $request->input('location', 'all');
        
        // Ensure page is a valid positive integer
        $page = (int) $request->input('page', 1);
        if ($page < 1) {
            $page = 1;
        }

        $pageSize = 10;

        $filtered = array_filter($this->mockEmployees, function ($emp) use ($search, $department, $status, $location) {
            if ($search) {
                $q = strtolower(trim($search));
                $haystack = strtolower($emp['name'] . ' ' . $emp['title'] . ' ' . $emp['email']);
                if (strpos($haystack, $q) === false) {
                    return false;
                }
            }

            if ($department !== 'all' && $emp['department'] !== $department) {
                return false;
            }

            if ($status !== 'all' && $emp['status'] !== $status) {
                return false;
            }

            if ($location !== 'all' && $emp['location'] !== $location) {
                return false;
            }

            return true;
        });

        // Re-index array after filtering
        $filtered = array_values($filtered);

        $totalCount = count($filtered);
        $offset = ($page - 1) * $pageSize;
        $paginated = array_slice($filtered, $offset, $pageSize);

        return response()->json([
            'data' => $paginated,
            'meta' => [
                'total' => $totalCount,
                'page' => $page,
                'pageSize' => $pageSize,
            ],
        ]);
    }
}
