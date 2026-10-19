// import Loginpage from './login-page-new'
import { Suspense } from "react"
import Loading from './loading'
// import { ConstructionRedirect } from 'Pending/utils/construction'
// import { getSession } from "@/services/login/auth";
// import { redirect } from 'next/navigation'
import UnderConstructiom from '@/view/asset/under-construction'
export default async function LoginPage() {
  // ConstructionRedirect()

  // const data = await getSession() || false;

  // if (data) redirect("/admin")

  return (
    // Your login page component here
    <Suspense fallback={<Loading />}>
      <section className='h-screen flex items-center'>
        {/* <Loginpage /> */}
        <UnderConstructiom />

      </section>
    </Suspense>


  );

}