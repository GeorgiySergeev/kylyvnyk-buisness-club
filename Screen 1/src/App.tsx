import { useEffect } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Bookmark,
  Briefcase,
  ChevronDown,
  CreditCard,
  Crown,
  Dumbbell,
  Gem,
  Globe,
  Globe2,
  Grid3x3,
  Handshake,
  Home,
  LayoutGrid,
  Lock,
  MapPin,
  Percent,
  Plane,
  Search,
  Stethoscope,
  User,
  UserPlus,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function App() {
  return (
    <div>
      <div className="bg-neutral-950 text-neutral-50 w-full h-fit h-fit min-h-screen w-screen min-w-screen max-w-screen overflow-visible">
        <nav className="border-white/10 border-t-0 border-r-0 border-b-1 border-l-0 border-solid flex px-12 py-6 flex-row justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="size-10 bg-[radial-gradient(circle_at_center,oklch(0.769_0.188_70.08),oklch(0.145_0_0))] border-[oklch(0.769_0.188_70.08)] rounded-full border-black/1 border-1 border-solid flex justify-center items-center">
              <Crown className="size-5 text-[oklch(0.769_0.188_70.08)]" />
            </div>
            <div className="leading-none flex flex-col">
              <span className="text-[oklch(0.769_0.188_70.08)] font-serif text-sm leading-5 tracking-[4.8px]">
                KYLYVNYK
              </span>
              <span className="text-[#a1a1a1] text-[10px] tracking-[6.4px]">
                BUSINESS CLUB
              </span>
            </div>
          </div>
          <div className="flex flex-row items-center gap-8">
            <a className="border-[oklch(0.769_0.188_70.08)] text-neutral-50 border-black/1 border-t-0 border-r-0 border-b-2 border-l-0 border-solid flex pb-1 items-center gap-2">
              <Home className="size-4" />
              <span className="text-sm leading-5">Главная</span>
            </a>
            <a className="text-[#a1a1a1] flex pb-1 items-center gap-2">
              <Grid3x3 className="size-4" />
              <span className="text-sm leading-5">Каталог</span>
            </a>
            <a className="text-[#a1a1a1] flex pb-1 items-center gap-2">
              <User className="size-4" />
              <span className="text-sm leading-5">Мой профиль</span>
            </a>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="text-[#a1a1a1] gap-2">
              <Globe className="size-4" />
              RU
            </Button>
            <Button className="bg-[oklch(0.769_0.188_70.08)] text-[oklch(0.145_0_0)]">
              Войти
            </Button>
          </div>
        </nav>
        <div className="flex px-12 py-8 flex-col gap-8">
          <div className="relative border-[oklch(0.769_0.188_70.08)]/30 rounded-3xl border-black/1 border-1 border-solid w-full h-105 overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600"
              alt="Globe"
              className="object-cover w-full h-full"
              data-photoid="GqLuB_DD16s"
              data-authorname="NASA"
              data-authorurl="https://unsplash.com/@nasa"
            />
            <div className="bg-[linear-gradient(180deg,oklch(0.145_0_0/.7)_0%,oklch(0.145_0_0/.4)_50%,oklch(0.145_0_0/.9)_100%)] absolute inset-0" />
            <div className="flex absolute inset-0 px-8 flex-col justify-center items-center gap-6">
              <div className="flex flex-col items-center gap-2">
                <Crown className="size-8 text-[oklch(0.769_0.188_70.08)]" />
                <h1 className="text-[oklch(0.769_0.188_70.08)] font-serif text-5xl leading-12 tracking-[3.2px]">
                  KYLYVNYK CLUB
                </h1>
                <div className="flex items-center gap-3">
                  <div className="bg-[oklch(0.769_0.188_70.08)] w-12 h-px" />
                  <span className="text-[#a1a1a1] text-xs leading-4 tracking-[6.4px]">
                    INTERNATIONAL BUSINESS CLUB
                  </span>
                  <div className="bg-[oklch(0.769_0.188_70.08)] w-12 h-px" />
                </div>
              </div>
              <p className="max-w-2xl font-light text-center text-neutral-50 text-2xl leading-8">
                Save. Develop your business.
                <span className="text-[oklch(0.769_0.188_70.08)]">
                  Live better.
                </span>
              </p>
              <div className="flex mt-2 flex-row gap-4">
                <Button className="border-[oklch(0.769_0.188_70.08)]/50 bg-neutral-900 text-neutral-50 border-black/1 border-1 border-solid p-6 gap-2">
                  <UserPlus className="size-4 text-[oklch(0.769_0.188_70.08)]" />
                  Get Card
                  <span className="text-[#a1a1a1] text-xs leading-4 ml-2">
                    Free
                  </span>
                </Button>
                <Button className="bg-[oklch(0.769_0.188_70.08)] text-[oklch(0.145_0_0)] p-6 gap-2">
                  <Gem className="size-4" />
                  Become a VIP Member
                  <span className="opacity-70 text-xs leading-4 ml-2">
                    $19.99/mo
                  </span>
                </Button>
                <Button className="border-[oklch(0.769_0.188_70.08)]/50 bg-neutral-900 text-neutral-50 border-black/1 border-1 border-solid p-6 gap-2">
                  <Briefcase className="size-4 text-[oklch(0.769_0.188_70.08)]" />
                  Submit Business
                  <span className="text-[#a1a1a1] text-xs leading-4 ml-2">
                    from $19.99
                  </span>
                </Button>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-6">
            <Card className="border-[oklch(0.769_0.188_70.08)]/30 bg-neutral-900 p-6 gap-2">
              <CardContent className="flex p-0 flex-col items-center gap-2">
                <div className="size-14 border-[oklch(0.769_0.188_70.08)] rounded-full border-black/1 border-2 border-solid flex justify-center items-center">
                  <Users className="size-6 text-[oklch(0.769_0.188_70.08)]" />
                </div>
                <span className="text-[oklch(0.769_0.188_70.08)] font-serif text-3xl leading-9">
                  10,245+
                </span>
                <span className="uppercase text-[#a1a1a1] text-xs leading-4 tracking-[4.8px]">
                  Members
                </span>
              </CardContent>
            </Card>
            <Card className="border-[oklch(0.769_0.188_70.08)]/30 bg-neutral-900 p-6 gap-2">
              <CardContent className="flex p-0 flex-col items-center gap-2">
                <div className="size-14 border-[oklch(0.769_0.188_70.08)] rounded-full border-black/1 border-2 border-solid flex justify-center items-center">
                  <Globe2 className="size-6 text-[oklch(0.769_0.188_70.08)]" />
                </div>
                <span className="text-[oklch(0.769_0.188_70.08)] font-serif text-3xl leading-9">
                  35+
                </span>
                <span className="uppercase text-[#a1a1a1] text-xs leading-4 tracking-[4.8px]">
                  Countries
                </span>
              </CardContent>
            </Card>
            <Card className="border-[oklch(0.769_0.188_70.08)]/30 bg-neutral-900 p-6 gap-2">
              <CardContent className="flex p-0 flex-col items-center gap-2">
                <div className="size-14 border-[oklch(0.769_0.188_70.08)] rounded-full border-black/1 border-2 border-solid flex justify-center items-center">
                  <Handshake className="size-6 text-[oklch(0.769_0.188_70.08)]" />
                </div>
                <span className="text-[oklch(0.769_0.188_70.08)] font-serif text-3xl leading-9">
                  1,250+
                </span>
                <span className="uppercase text-[#a1a1a1] text-xs leading-4 tracking-[4.8px]">
                  Partners
                </span>
              </CardContent>
            </Card>
          </div>
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="bg-[oklch(0.769_0.188_70.08)] w-8 h-px" />
                <h2 className="uppercase text-neutral-50 text-xl leading-7 tracking-[4.8px]">
                  Top Partners
                </h2>
              </div>
              <Button
                variant="ghost"
                className="text-[oklch(0.769_0.188_70.08)] gap-2"
              >
                View all
                <ArrowRight className="size-4" />
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-6">
              <Card className="border-[oklch(0.769_0.188_70.08)]/30 bg-neutral-900 p-0 gap-0 overflow-hidden">
                <div className="relative h-32">
                  <img
                    src="https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600"
                    alt="Swiss Alps"
                    className="object-cover w-full h-full"
                    data-photoid="3uHPjQjqQ0o"
                    data-authorname="Samuel Ferrara"
                    data-authorurl="https://unsplash.com/@samferrara"
                  />
                  <div className="bg-[linear-gradient(180deg,transparent_0%,oklch(0.145_0_0/.8)_100%)] absolute inset-0" />
                  <div className="rounded-md bg-neutral-900/80 text-xs leading-4 absolute left-3 top-3 px-2 py-1">
                    🇨🇭 CH
                  </div>
                  <div className="bg-[oklch(0.769_0.188_70.08)] text-[oklch(0.145_0_0)] font-semibold rounded-md text-sm leading-5 absolute right-3 bottom-3 px-3 py-1">
                    -20%
                  </div>
                </div>
                <CardContent className="flex p-6 flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <h3 className="font-serif text-neutral-50 text-lg leading-7">
                      Swiss Legal Group
                    </h3>
                    <BadgeCheck className="size-4 text-[oklch(0.769_0.188_70.08)]" />
                  </div>
                  <p className="text-[#a1a1a1] text-xs leading-4">
                    Legal Services · Zürich
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-[oklch(0.769_0.188_70.08)]/50 text-[oklch(0.769_0.188_70.08)] mt-2"
                  >
                    Details
                    <ArrowRight className="size-3 ml-1" />
                  </Button>
                </CardContent>
              </Card>
              <Card className="border-[oklch(0.769_0.188_70.08)]/30 bg-neutral-900 p-0 gap-0 overflow-hidden">
                <div className="relative h-32">
                  <img
                    src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600"
                    alt="Auto"
                    className="object-cover w-full h-full"
                    data-photoid="NoRsyXmHGpI"
                    data-authorname="Erik Mclean"
                    data-authorurl="https://unsplash.com/@introspectivedsgn"
                  />
                  <div className="bg-[linear-gradient(180deg,transparent_0%,oklch(0.145_0_0/.8)_100%)] absolute inset-0" />
                  <div className="rounded-md bg-neutral-900/80 text-xs leading-4 absolute left-3 top-3 px-2 py-1">
                    🇨🇦 CA
                  </div>
                  <div className="bg-[oklch(0.769_0.188_70.08)] text-[oklch(0.145_0_0)] font-semibold rounded-md text-sm leading-5 absolute right-3 bottom-3 px-3 py-1">
                    -15%
                  </div>
                </div>
                <CardContent className="flex p-6 flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <h3 className="font-serif text-neutral-50 text-lg leading-7">
                      Auto Premium
                    </h3>
                    <BadgeCheck className="size-4 text-[oklch(0.769_0.188_70.08)]" />
                  </div>
                  <p className="text-[#a1a1a1] text-xs leading-4">
                    Auto Salon · Toronto
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-[oklch(0.769_0.188_70.08)]/50 text-[oklch(0.769_0.188_70.08)] mt-2"
                  >
                    Details
                    <ArrowRight className="size-3 ml-1" />
                  </Button>
                </CardContent>
              </Card>
              <Card className="border-[oklch(0.769_0.188_70.08)]/30 bg-neutral-900 p-0 gap-0 overflow-hidden">
                <div className="relative h-32">
                  <img
                    src="https://images.unsplash.com/photo-1496171367470-9ed9a91ea931?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600"
                    alt="NYC"
                    className="object-cover w-full h-full"
                    data-photoid="yZygONrUBe8"
                    data-authorname="Jonathan Riley"
                    data-authorurl="https://unsplash.com/@jonathanriley"
                  />
                  <div className="bg-[linear-gradient(180deg,transparent_0%,oklch(0.145_0_0/.8)_100%)] absolute inset-0" />
                  <div className="rounded-md bg-neutral-900/80 text-xs leading-4 absolute left-3 top-3 px-2 py-1">
                    🇺🇸 US
                  </div>
                  <div className="bg-[oklch(0.769_0.188_70.08)] text-[oklch(0.145_0_0)] font-semibold rounded-md text-sm leading-5 absolute right-3 bottom-3 px-3 py-1">
                    -15%
                  </div>
                </div>
                <CardContent className="flex p-6 flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <h3 className="font-serif text-neutral-50 text-lg leading-7">
                      WebCraft
                    </h3>
                    <BadgeCheck className="size-4 text-[oklch(0.769_0.188_70.08)]" />
                  </div>
                  <p className="text-[#a1a1a1] text-xs leading-4">{`IT & Web Development · New York`}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-[oklch(0.769_0.188_70.08)]/50 text-[oklch(0.769_0.188_70.08)] mt-2"
                  >
                    Details
                    <ArrowRight className="size-3 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <div className="bg-[oklch(0.769_0.188_70.08)] w-8 h-px" />
              <h2 className="uppercase text-neutral-50 text-xl leading-7 tracking-[4.8px]">
                How It Works
              </h2>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <Card className="border-[oklch(0.769_0.188_70.08)]/30 bg-neutral-900 p-6 gap-4">
                <CardHeader className="p-0 gap-2">
                  <div className="flex justify-between items-center">
                    <span className="size-8 border-[oklch(0.769_0.188_70.08)] text-[oklch(0.769_0.188_70.08)] rounded-full text-xs leading-4 border-black/1 border-1 border-solid flex justify-center items-center">
                      01
                    </span>
                    <UserPlus className="size-6 text-[oklch(0.769_0.188_70.08)]" />
                  </div>
                </CardHeader>
                <CardContent className="p-0 gap-2">
                  <h3 className="uppercase text-neutral-50 text-sm leading-5 tracking-[3.2px]">
                    Registration
                  </h3>
                  <p className="text-[#a1a1a1] text-xs leading-4">
                    Fast registration in the club.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-[oklch(0.769_0.188_70.08)]/30 bg-neutral-900 p-6 gap-4">
                <CardHeader className="p-0 gap-2">
                  <div className="flex justify-between items-center">
                    <span className="size-8 border-[oklch(0.769_0.188_70.08)] text-[oklch(0.769_0.188_70.08)] rounded-full text-xs leading-4 border-black/1 border-1 border-solid flex justify-center items-center">
                      02
                    </span>
                    <CreditCard className="size-6 text-[oklch(0.769_0.188_70.08)]" />
                  </div>
                </CardHeader>
                <CardContent className="p-0 gap-2">
                  <h3 className="uppercase text-neutral-50 text-sm leading-5 tracking-[3.2px]">
                    Receive Card
                  </h3>
                  <p className="text-[#a1a1a1] text-xs leading-4">
                    Digital club card in your account.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-[oklch(0.769_0.188_70.08)]/30 bg-neutral-900 p-6 gap-4">
                <CardHeader className="p-0 gap-2">
                  <div className="flex justify-between items-center">
                    <span className="size-8 border-[oklch(0.769_0.188_70.08)] text-[oklch(0.769_0.188_70.08)] rounded-full text-xs leading-4 border-black/1 border-1 border-solid flex justify-center items-center">
                      03
                    </span>
                    <Search className="size-6 text-[oklch(0.769_0.188_70.08)]" />
                  </div>
                </CardHeader>
                <CardContent className="p-0 gap-2">
                  <h3 className="uppercase text-neutral-50 text-sm leading-5 tracking-[3.2px]">
                    Find Partners
                  </h3>
                  <p className="text-[#a1a1a1] text-xs leading-4">
                    Search by countries, cities, and categories.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-[oklch(0.769_0.188_70.08)]/30 bg-neutral-900 p-6 gap-4">
                <CardHeader className="p-0 gap-2">
                  <div className="flex justify-between items-center">
                    <span className="size-8 border-[oklch(0.769_0.188_70.08)] text-[oklch(0.769_0.188_70.08)] rounded-full text-xs leading-4 border-black/1 border-1 border-solid flex justify-center items-center">
                      04
                    </span>
                    <Percent className="size-6 text-[oklch(0.769_0.188_70.08)]" />
                  </div>
                </CardHeader>
                <CardContent className="p-0 gap-2">
                  <h3 className="uppercase text-neutral-50 text-sm leading-5 tracking-[3.2px]">
                    Special Access
                  </h3>
                  <p className="text-[#a1a1a1] text-xs leading-4">
                    Offers available after login.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
          <Card className="border-[oklch(0.769_0.188_70.08)]/30 bg-neutral-900 p-8 gap-6">
            <CardHeader className="p-0 flex-row justify-between items-center gap-2">
              <div className="flex items-center gap-4">
                <div className="bg-[oklch(0.769_0.188_70.08)] w-8 h-px" />
                <h2 className="uppercase text-neutral-50 text-xl leading-7 tracking-[4.8px]">
                  Find Partners
                </h2>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-4 p-0 gap-4">
              <div className="rounded-xl bg-neutral-800 flex px-4 py-3 items-center gap-2">
                <Globe className="size-4 text-[oklch(0.769_0.188_70.08)]" />
                <span className="text-[#a1a1a1] text-sm leading-5 flex-1">
                  All countries
                </span>
                <ChevronDown className="size-4 text-[#a1a1a1]" />
              </div>
              <div className="rounded-xl bg-neutral-800 flex px-4 py-3 items-center gap-2">
                <MapPin className="size-4 text-[oklch(0.769_0.188_70.08)]" />
                <span className="text-[#a1a1a1] text-sm leading-5 flex-1">
                  All cities
                </span>
                <ChevronDown className="size-4 text-[#a1a1a1]" />
              </div>
              <div className="rounded-xl bg-neutral-800 flex px-4 py-3 items-center gap-2">
                <LayoutGrid className="size-4 text-[oklch(0.769_0.188_70.08)]" />
                <span className="text-[#a1a1a1] text-sm leading-5 flex-1">
                  All categories
                </span>
                <ChevronDown className="size-4 text-[#a1a1a1]" />
              </div>
              <Button className="bg-[oklch(0.769_0.188_70.08)] text-[oklch(0.145_0_0)] gap-2">
                <Search className="size-4" />
                Find a Partner
              </Button>
            </CardContent>
          </Card>
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="bg-[oklch(0.769_0.188_70.08)] w-8 h-px" />
                <h2 className="uppercase text-neutral-50 text-xl leading-7 tracking-[4.8px]">
                  Recommended Partners
                </h2>
              </div>
              <Button
                variant="ghost"
                className="text-[oklch(0.769_0.188_70.08)] gap-2"
              >
                Show More
                <ArrowRight className="size-4" />
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-6">
              <Card className="border-[oklch(0.769_0.188_70.08)]/30 bg-neutral-900 p-6 gap-4">
                <CardHeader className="p-0 flex-row justify-between items-start gap-2">
                  <div className="size-12 rounded-xl bg-neutral-800 flex justify-center items-center">
                    <Stethoscope className="size-6 text-[oklch(0.769_0.188_70.08)]" />
                  </div>
                  <Bookmark className="size-4 text-[#a1a1a1]" />
                </CardHeader>
                <CardContent className="p-0 gap-2">
                  <h3 className="font-serif text-neutral-50 text-lg leading-7">
                    Dental Care Clinic
                  </h3>
                  <p className="text-[#a1a1a1] text-xs leading-4">
                    Medical · Kyiv, Ukraine
                  </p>
                  <div className="border-white/10 border-t-1 border-r-0 border-b-0 border-l-0 border-solid flex mt-2 pt-2 items-center gap-2">
                    <Lock className="size-3 text-[oklch(0.769_0.188_70.08)]" />
                    <span className="text-[#a1a1a1] text-xs leading-4">
                      Special conditions after registration
                    </span>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-[oklch(0.769_0.188_70.08)]/30 bg-neutral-900 p-6 gap-4">
                <CardHeader className="p-0 flex-row justify-between items-start gap-2">
                  <div className="size-12 rounded-xl bg-neutral-800 flex justify-center items-center">
                    <Dumbbell className="size-6 text-[oklch(0.769_0.188_70.08)]" />
                  </div>
                  <Bookmark className="size-4 text-[#a1a1a1]" />
                </CardHeader>
                <CardContent className="p-0 gap-2">
                  <h3 className="font-serif text-neutral-50 text-lg leading-7">{`Fit & Strong`}</h3>
                  <p className="text-[#a1a1a1] text-xs leading-4">
                    Fitness Club · Berlin, Germany
                  </p>
                  <div className="border-white/10 border-t-1 border-r-0 border-b-0 border-l-0 border-solid flex mt-2 pt-2 items-center gap-2">
                    <Lock className="size-3 text-[oklch(0.769_0.188_70.08)]" />
                    <span className="text-[#a1a1a1] text-xs leading-4">
                      Special conditions after registration
                    </span>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-[oklch(0.769_0.188_70.08)]/30 bg-neutral-900 p-6 gap-4">
                <CardHeader className="p-0 flex-row justify-between items-start gap-2">
                  <div className="size-12 rounded-xl bg-neutral-800 flex justify-center items-center">
                    <Plane className="size-6 text-[oklch(0.769_0.188_70.08)]" />
                  </div>
                  <Bookmark className="size-4 text-[#a1a1a1]" />
                </CardHeader>
                <CardContent className="p-0 gap-2">
                  <h3 className="font-serif text-neutral-50 text-lg leading-7">
                    Travel World
                  </h3>
                  <p className="text-[#a1a1a1] text-xs leading-4">
                    Tourism · Istanbul, Turkey
                  </p>
                  <div className="border-white/10 border-t-1 border-r-0 border-b-0 border-l-0 border-solid flex mt-2 pt-2 items-center gap-2">
                    <Lock className="size-3 text-[oklch(0.769_0.188_70.08)]" />
                    <span className="text-[#a1a1a1] text-xs leading-4">
                      Special conditions after registration
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          <div className="border-white/10 border-t-1 border-r-0 border-b-0 border-l-0 border-solid flex pt-8 flex-row justify-between items-center">
            <div className="flex items-center gap-2">
              <Crown className="size-4 text-[oklch(0.769_0.188_70.08)]" />
              <span className="text-[#a1a1a1] text-xs leading-4 tracking-[4.8px]">
                © 2025 KYLYVNYK CLUB
              </span>
            </div>
            <div className="text-[#a1a1a1] text-xs leading-4 flex items-center gap-6">
              <a>Privacy Policy</a>
              <a>{`Terms & Conditions`}</a>
              <a>Cookie Policy</a>
              <a>Disclaimer</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
