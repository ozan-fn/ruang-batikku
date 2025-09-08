import { Head, Link, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

type LoginForm = {
    email: string;
    password: string;
    remember: boolean;
};

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm<Required<LoginForm>>({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthLayout>
            <Head title="Log in" />

            <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4">
                <div className="size- inline-flex flex-col items-start justify-start gap-4 pt-6">
                    <div className="justify-start text-2xl font-bold text-black">MASUK KE DUNIA BATIK</div>
                    <div className="max-w-[768px] justify-start text-base font-normal text-black">
                        Masuk dan temukan kisah di balik setiap motif. Batik bukan sekadar kain — ia adalah cerita, seni, dan jiwa Nusantara.
                    </div>
                </div>

                <form className="flex max-w-md flex-col gap-6" onSubmit={submit}>
                    <div className="grid gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Alamat email</Label>
                            <Input
                                id="email"
                                type="email"
                                required
                                autoFocus
                                tabIndex={1}
                                autoComplete="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="email@example.com"
                            />
                            <InputError message={errors.email} />
                        </div>

                        <div className="grid gap-2">
                            <div className="flex items-center">
                                <Label htmlFor="password">Kata sandi</Label>
                                {canResetPassword && (
                                    <TextLink href={route('password.request')} className="ml-auto text-sm" tabIndex={5}>
                                        Forgot password?
                                    </TextLink>
                                )}
                            </div>
                            <Input
                                id="password"
                                type="password"
                                required
                                tabIndex={2}
                                autoComplete="current-password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder="Password"
                            />
                            <InputError message={errors.password} />
                        </div>

                        <div className="flex items-center space-x-3">
                            <Checkbox
                                id="remember"
                                name="remember"
                                checked={data.remember}
                                onClick={() => setData('remember', !data.remember)}
                                tabIndex={3}
                            />
                            <Label htmlFor="remember">Ingat saya</Label>
                        </div>

                        <Button type="submit" className="w-full" tabIndex={4} disabled={processing}>
                            {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                            MASUK
                        </Button>

                        {/* <div className="inline-flex items-center justify-center gap-2 py-2">
                            <div className="relative h-1 flex-1 rounded-lg bg-[#532f16]/40" />
                            <div className="justify-start text-xs font-bold text-[#532f16]/40">atau masuk dengan</div>
                            <div className="relative h-1 flex-1 rounded-lg bg-[#532f16]/40" />
                        </div>

                        <div className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-sm bg-white py-1">
                            <div data-svg-wrapper className="relative">
                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M7.13997 5.72729V8.43821H10.9072C10.7418 9.31003 10.2454 10.0482 9.50085 10.5446L11.7727 12.3073C13.0963 11.0856 13.8599 9.291 13.8599 7.15919C13.8599 6.66283 13.8154 6.18551 13.7326 5.72737L7.13997 5.72729Z"
                                        fill="#4285F4"
                                    />
                                    <path
                                        d="M3.21697 8.33228L2.7046 8.7245L0.89093 10.1372C2.04275 12.4217 4.40348 13.9999 7.13982 13.9999C9.02977 13.9999 10.6143 13.3763 11.7725 12.3072L9.5007 10.5445C8.87706 10.9645 8.0816 11.2191 7.13982 11.2191C5.31983 11.2191 3.77351 9.99088 3.21984 8.33632L3.21697 8.33228Z"
                                        fill="#34A853"
                                    />
                                    <path
                                        d="M0.89093 3.86279C0.413683 4.80457 0.140076 5.86732 0.140076 7.00003C0.140076 8.13274 0.413683 9.19549 0.89093 10.1373C0.89093 10.1436 3.22006 8.32999 3.22006 8.32999C3.08006 7.90999 2.99731 7.46456 2.99731 6.99996C2.99731 6.53535 3.08006 6.08992 3.22006 5.66992L0.89093 3.86279Z"
                                        fill="#FBBC05"
                                    />
                                    <path
                                        d="M7.13996 2.78728C8.17089 2.78728 9.08724 3.14363 9.81905 3.83092L11.8236 1.82639C10.6081 0.693681 9.02999 0 7.13996 0C4.40362 0 2.04275 1.57182 0.89093 3.86274L3.21999 5.67002C3.77359 4.01545 5.31997 2.78728 7.13996 2.78728Z"
                                        fill="#EA4335"
                                    />
                                </svg>
                            </div>
                            <div className="justify-start font-['Anek_Latin'] text-sm font-bold text-black">Google</div>
                        </div> */}
                    </div>

                    <div className="justify-start">
                        <span className="text-sm font-bold text-black">Belum punya akun? </span>
                        <Link href={route('register')} className="text-sm font-bold text-[#955932] hover:underline">
                            Daftar.
                        </Link>
                    </div>
                    {/* <div className="text-center text-sm text-muted-foreground">
                        Don't have an account?{' '}
                        <TextLink href={route('register')} tabIndex={5}>
                            Sign up
                        </TextLink>
                    </div> */}
                </form>
            </div>

            {status && <div className="mb-4 text-center text-sm font-medium text-green-600">{status}</div>}
        </AuthLayout>
    );
}
