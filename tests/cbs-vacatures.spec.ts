import request from "supertest";

const baseUrl = "https://www.cbs.nl/odata/v1";

describe("Vacancies", () => {
    it("GET /Vacancies should return vacancies", async () => {
        const response = await request(baseUrl).get("/Vacancies").set("Accept", "application/json");
        expectValidOdataResponse(response);

        const vacancies = response.body.value;
        expect(vacancies.length).toBeGreaterThan(0);
        expectValidVacancies(vacancies);
    });

    it("GET /Vacancies$top=2 should return only specified number of vacancies", async () => {
        const numberOfVacancies = 2;
        const response = await request(baseUrl).get(`/Vacancies?$top=${numberOfVacancies}`).set("Accept", "application/json");
        expectValidOdataResponse(response);

        const vacancies = response.body.value;
        expect(vacancies).toHaveLength(numberOfVacancies);
        expectValidVacancies(vacancies);
    });

    it("GET /Vacancies?$skip=2 should return all but skipped vacancies", async () => {
        const skippedVacancies = 2;
        const responseIncludingSkipped = await request(baseUrl).get(`/Vacancies`).set("Accept", "application/json");
        const responseExcludingSkipped = await request(baseUrl).get(`/Vacancies?$skip=${skippedVacancies}`).set("Accept", "application/json");
        expectValidOdataResponse(responseExcludingSkipped);

        const vacanciesIncludingSkipped = responseIncludingSkipped.body.value;
        const vacanciesExcludingSkipped = responseExcludingSkipped.body.value;
        expectValidVacancies(vacanciesExcludingSkipped);
        expect(vacanciesIncludingSkipped).toHaveLength(vacanciesExcludingSkipped.length + skippedVacancies);
        expect(vacanciesExcludingSkipped[0]).toEqual(vacanciesIncludingSkipped[skippedVacancies]);
        expect(vacanciesExcludingSkipped.reverse()[0]).toEqual(vacanciesIncludingSkipped.reverse()[0]);
    });

    it("GET /Vacancy(uniqueId) should return vacancy specified by uniqueId", async () => {
        const responseAll = await request(baseUrl).get("/Vacancies?$top=1").set("Accept", "application/json");
        const uniqueId = responseAll.body.value[0].UniqueId;
        const response = await request(baseUrl).get(`/Vacancies('${uniqueId}')`).set("Accept", "application/json");
        expectValidOdataResponse(response);

        const vacancy = response.body;
        expect(vacancy.UniqueId).toEqual(uniqueId);
        expect(vacancy.Title).toEqual(responseAll.body.value[0].Title);
        expectValidVacancy(vacancy);
    });

    it("GET /Vacancy(nonexistentUniqueId) should return nothing for nonexistent vacancy", async () => {
        const uniqueId = "00000000-0000-0000-0000-000000000000-nl-nl";
        const response = await request(baseUrl).get(`/Vacancies('${uniqueId}')`).set("Accept", "application/json");
        expect(response.status).toEqual(204);
    });

    it("DELETE /Vacancy(uniqueId) should return method not allowed", async () => {
        const uniqueId = "12345678-0000-0000-0000-000000000000-nl-nl";
        const response = await request(baseUrl).delete(`/Vacancies('${uniqueId}')`).set("Accept", "application/json");
        expect(response.status).toEqual(405);
    });

    function expectValidOdataResponse(response: any) {
        expect(response.status).toEqual(200);
        expect(response.headers["odata-version"]).toEqual("4.0");
        expect(response.headers["content-type"]).toContain("application/json");
        expect(response.headers["content-type"]).toContain("charset=utf-8");
    }

    function expectValidVacancies(vacancies: any[]) {
        vacancies.forEach(vacancy => {
            expectValidVacancy(vacancy);
        });
    }

    function expectValidVacancy(vacancy: any) {
        expect(vacancy.UniqueId).toHaveLength(42); // <UUID>-nl-nl
        expect(vacancy.Title.length).toBeGreaterThan(5); // Jurist
        expect(vacancy.MetaDescription.length).toBeGreaterThan(20);
        expect(vacancy.MinSalary).toBeGreaterThan(500);
        expect(vacancy.MinSalary).toBeLessThan(9999);
        expect(vacancy.MaxSalary).toBeGreaterThanOrEqual(vacancy.MinSalary);
        expect(vacancy.MaxSalary).toBeLessThan(9999);
        expect(vacancy.Salary).toEqual(`€ ${vacancy.MinSalary} tot € ${vacancy.MaxSalary}`);
        expect(vacancy.SalaryPeriod).toEqual("MONTH");
        expect(vacancy.YourProfile).toMatch(/ervaring|niveau/);
        expect(new Date(vacancy.PublicationDate).getFullYear()).toBeGreaterThanOrEqual(new Date().getFullYear() - 1);
    }
})