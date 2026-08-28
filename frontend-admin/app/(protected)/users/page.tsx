import { getUsers, getCountries } from "@/lib/actions/admin"
import { UsersClient } from "@/components/users-client"

export default async function UsersPage() {
  const [usersData, countries] = await Promise.all([
    getUsers({ page: 1, limit: 10 }),
    getCountries()
  ])

  return (
    <UsersClient 
      initialUsers={usersData.users} 
      initialTotal={usersData.total}
      countries={countries}
    />
  )
}
