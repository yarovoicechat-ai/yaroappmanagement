import { redirect } from 'next/navigation';

export default function MembershipRedirect() {
    return redirect('/plans/svip');
}
