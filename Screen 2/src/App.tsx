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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

export default function App() {
  return (
    <div>
      <div className="bg-neutral-950 text-neutral-50 w-full h-fit h-fit min-h-screen w-screen min-w-screen max-w-screen overflow-visible">
        <div className="flex px-6 pt-6 pb-4 justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="size-9 border-[oklch(0.769_0.188_70.08)]/40 rounded-full border-black/1 border-1 border-solid flex justify-center items-center">
              <Crown className="size-4 text-[oklch(0.769_0.188_70.08)]" />
            </div>
            <div className="leading-tight flex flex-col">
              <span className="font-serif text-neutral-50 text-sm leading-5 tracking-[3px]">
                KYLYVNYK
              </span>
              <span className="text-[oklch(0.769_0.188_70.08)] text-[8px] tracking-[2.4px]">
                BUSINESS CLUB
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-[#a1a1a1] px-2 gap-1 h-8"
            >
              <Globe className="size-3.5" />
              <span className="text-xs leading-4">RU</span>
            </Button>
            <Button
              size="sm"
              className="bg-[oklch(0.769_0.188_70.08)] font-medium text-neutral-950 text-xs leading-4 px-4 h-8"
            >
              Войти
            </Button>
          </div>
        </div>
        <div className="px-4 pb-6">
          <div className="relative rounded-2xl h-115 overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800"
              alt="globe"
              className="object-cover absolute inset-0 w-full h-full"
              data-photoid="globe-hero"
              data-authorname="NASA"
              data-authorurl="https://unsplash.com/@nasa"
              data-blurhash="L23l5lWBaej[~qj[fQayofayfQay"
            />
            <div className="bg-[linear-gradient(180deg,oklch(0.145_0_0/.5)_0%,oklch(0.145_0_0/.75)_50%,oklch(0.145_0_0/.9)_100%)] absolute inset-0" />
            <div className="relative text-center flex px-6 flex-col justify-center items-center h-full">
              <Crown className="size-6 text-[oklch(0.769_0.188_70.08)] mb-4" />
              <h1 className="font-serif text-neutral-50 text-3xl leading-9 tracking-wide">
                KYLYVNYK CLUB
              </h1>
              <div className="flex mt-3 items-center gap-2">
                <div className="bg-[oklch(0.769_0.188_70.08)]/60 w-8 h-px" />
                <span className="text-[oklch(0.769_0.188_70.08)] text-[9px] tracking-[3px]">
                  INTERNATIONAL BUSINESS CLUB
                </span>
                <div className="bg-[oklch(0.769_0.188_70.08)]/60 w-8 h-px" />
              </div>
              <p className="leading-relaxed text-[#a1a1a1] text-sm leading-5 mt-6">
                Save. Develop your business.
                <br />
                <span className="text-[oklch(0.769_0.188_70.08)]">
                  Live better.
                </span>
              </p>
              <div className="flex mt-8 flex-col gap-2 w-full">
                <Button className="bg-[oklch(0.769_0.188_70.08)] text-neutral-950 px-4 justify-between w-full h-11">
                  <span className="flex items-center gap-2">
                    <Gem className="size-4" />
                    Become a VIP Member
                  </span>
                  <span className="opacity-80 text-xs leading-4">
                    $19.99/mo
                  </span>
                </Button>
                <Button
                  variant="outline"
                  className="bg-neutral-900/40 border-white/10 border-0 border-solid px-4 justify-between w-full h-11"
                >
                  <span className="flex items-center gap-2">
                    <UserPlus className="size-4" />
                    Get Card
                  </span>
                  <span className="text-[#a1a1a1] text-xs leading-4">Free</span>
                </Button>
                <Button
                  variant="outline"
                  className="bg-neutral-900/40 border-white/10 border-0 border-solid px-4 justify-between w-full h-11"
                >
                  <span className="flex items-center gap-2">
                    <Briefcase className="size-4" />
                    Submit Business
                  </span>
                  <span className="text-[#a1a1a1] text-xs leading-4">
                    from $19.99
                  </span>
                </Button>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 px-4 pb-8 gap-2">
          <Card className="text-center bg-neutral-900 border-white/10 border-0 border-solid p-4 items-center gap-2">
            <div className="size-10 border-[oklch(0.769_0.188_70.08)]/40 rounded-full border-black/1 border-1 border-solid flex mx-auto justify-center items-center">
              <Users className="size-4 text-[oklch(0.769_0.188_70.08)]" />
            </div>
            <CardContent className="text-center p-0 gap-1">
              <div className="font-serif text-lg leading-7">10,245+</div>
              <div className="text-[#a1a1a1] text-[9px] tracking-[2px]">
                MEMBERS
              </div>
            </CardContent>
          </Card>
          <Card className="text-center bg-neutral-900 border-white/10 border-0 border-solid p-4 items-center gap-2">
            <div className="size-10 border-[oklch(0.769_0.188_70.08)]/40 rounded-full border-black/1 border-1 border-solid flex mx-auto justify-center items-center">
              <Globe className="size-4 text-[oklch(0.769_0.188_70.08)]" />
            </div>
            <CardContent className="text-center p-0 gap-1">
              <div className="font-serif text-lg leading-7">35+</div>
              <div className="text-[#a1a1a1] text-[9px] tracking-[2px]">
                COUNTRIES
              </div>
            </CardContent>
          </Card>
          <Card className="text-center bg-neutral-900 border-white/10 border-0 border-solid p-4 items-center gap-2">
            <div className="size-10 border-[oklch(0.769_0.188_70.08)]/40 rounded-full border-black/1 border-1 border-solid flex mx-auto justify-center items-center">
              <Handshake className="size-4 text-[oklch(0.769_0.188_70.08)]" />
            </div>
            <CardContent className="text-center p-0 gap-1">
              <div className="font-serif text-lg leading-7">1,250+</div>
              <div className="text-[#a1a1a1] text-[9px] tracking-[2px]">
                PARTNERS
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="px-6 pb-6">
          <div className="flex mb-4 justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="bg-[oklch(0.769_0.188_70.08)] w-6 h-px" />
              <span className="text-neutral-50 text-xs leading-4 tracking-[3px]">
                TOP PARTNERS
              </span>
            </div>
            <button className="text-[oklch(0.769_0.188_70.08)] text-xs leading-4 flex items-center gap-1">
              View all
              <ArrowRight className="size-3" />
            </button>
          </div>
          <div className="overflow-x-auto flex -mx-6 px-6 pb-2 gap-3">
            <Card className="min-w-[260px] bg-neutral-900 border-white/10 border-0 border-solid p-0 gap-0 overflow-hidden">
              <div className="relative h-32">
                <img
                  src="https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400"
                  alt="swiss"
                  className="object-cover w-full h-full"
                  data-photoid="swiss"
                  data-authorname="Unsplash"
                  data-authorurl="https://unsplash.com"
                  data-blurhash="LKF~6;t7Mxay~qj]ofWB%MofRjof"
                />
                <Badge className="bg-neutral-900/80 text-neutral-50 text-[10px] absolute left-2 top-2 gap-1">
                  🇨🇭 CH
                </Badge>
                <Badge className="bg-[oklch(0.769_0.188_70.08)] text-neutral-950 text-[10px] absolute right-2 bottom-2">
                  -20%
                </Badge>
              </div>
              <CardContent className="p-4 gap-1">
                <div className="flex justify-between items-center">
                  <div className="font-serif text-base leading-6">
                    Swiss Legal Group
                  </div>
                  <BadgeCheck className="size-4 text-[oklch(0.769_0.188_70.08)]" />
                </div>
                <div className="text-[#a1a1a1] text-xs leading-4">
                  Legal Services · Zürich
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[oklch(0.769_0.188_70.08)] mt-2 px-0 justify-between h-8"
                >
                  Details
                  <ArrowRight className="size-3" />
                </Button>
              </CardContent>
            </Card>
            <Card className="min-w-[260px] bg-neutral-900 border-white/10 border-0 border-solid p-0 gap-0 overflow-hidden">
              <div className="relative h-32">
                <img
                  src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400"
                  alt="auto"
                  className="object-cover w-full h-full"
                  data-photoid="auto"
                  data-authorname="Unsplash"
                  data-authorurl="https://unsplash.com"
                  data-blurhash="L01o~T~q~q~q~q~q~q~q~q~q~q~q"
                />
                <Badge className="bg-neutral-900/80 text-neutral-50 text-[10px] absolute left-2 top-2 gap-1">
                  🇨🇦 CA
                </Badge>
                <Badge className="bg-[oklch(0.769_0.188_70.08)] text-neutral-950 text-[10px] absolute right-2 bottom-2">
                  -15%
                </Badge>
              </div>
              <CardContent className="p-4 gap-1">
                <div className="flex justify-between items-center">
                  <div className="font-serif text-base leading-6">
                    Auto Premium
                  </div>
                  <BadgeCheck className="size-4 text-[oklch(0.769_0.188_70.08)]" />
                </div>
                <div className="text-[#a1a1a1] text-xs leading-4">
                  Auto Salon · Toronto
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[oklch(0.769_0.188_70.08)] mt-2 px-0 justify-between h-8"
                >
                  Details
                  <ArrowRight className="size-3" />
                </Button>
              </CardContent>
            </Card>
            <Card className="min-w-[260px] bg-neutral-900 border-white/10 border-0 border-solid p-0 gap-0 overflow-hidden">
              <div className="relative h-32">
                <img
                  src="https://images.unsplash.com/photo-1531297484001-80022131f5a1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400"
                  alt="web"
                  className="object-cover w-full h-full"
                  data-photoid="web"
                  data-authorname="Unsplash"
                  data-authorurl="https://unsplash.com"
                  data-blurhash="L02Yq8~q~q~q~q~q~q~q~q~q~q~q"
                />
                <Badge className="bg-neutral-900/80 text-neutral-50 text-[10px] absolute left-2 top-2 gap-1">
                  🇺🇸 US
                </Badge>
                <Badge className="bg-[oklch(0.769_0.188_70.08)] text-neutral-950 text-[10px] absolute right-2 bottom-2">
                  -15%
                </Badge>
              </div>
              <CardContent className="p-4 gap-1">
                <div className="flex justify-between items-center">
                  <div className="font-serif text-base leading-6">WebCraft</div>
                  <BadgeCheck className="size-4 text-[oklch(0.769_0.188_70.08)]" />
                </div>
                <div className="text-[#a1a1a1] text-xs leading-4">{`IT & Web Dev · New York`}</div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[oklch(0.769_0.188_70.08)] mt-2 px-0 justify-between h-8"
                >
                  Details
                  <ArrowRight className="size-3" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
        <div className="px-6 pb-8">
          <div className="flex mb-4 items-center gap-2">
            <div className="bg-[oklch(0.769_0.188_70.08)] w-6 h-px" />
            <span className="text-neutral-50 text-xs leading-4 tracking-[3px]">
              HOW IT WORKS
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Card className="bg-neutral-900 border-white/10 border-0 border-solid p-4 gap-3">
              <div className="flex justify-between items-center">
                <span className="text-[oklch(0.769_0.188_70.08)] text-[10px] tracking-[2px]">
                  01
                </span>
                <UserPlus className="size-4 text-[oklch(0.769_0.188_70.08)]" />
              </div>
              <CardContent className="p-0 gap-1">
                <div className="text-sm leading-5 tracking-[2px]">
                  REGISTRATION
                </div>
                <div className="text-[#a1a1a1] text-[11px]">
                  Fast registration in the club.
                </div>
              </CardContent>
            </Card>
            <Card className="bg-neutral-900 border-white/10 border-0 border-solid p-4 gap-3">
              <div className="flex justify-between items-center">
                <span className="text-[oklch(0.769_0.188_70.08)] text-[10px] tracking-[2px]">
                  02
                </span>
                <CreditCard className="size-4 text-[oklch(0.769_0.188_70.08)]" />
              </div>
              <CardContent className="p-0 gap-1">
                <div className="text-sm leading-5 tracking-[2px]">
                  RECEIVE CARD
                </div>
                <div className="text-[#a1a1a1] text-[11px]">
                  Digital club card in account.
                </div>
              </CardContent>
            </Card>
            <Card className="bg-neutral-900 border-white/10 border-0 border-solid p-4 gap-3">
              <div className="flex justify-between items-center">
                <span className="text-[oklch(0.769_0.188_70.08)] text-[10px] tracking-[2px]">
                  03
                </span>
                <Search className="size-4 text-[oklch(0.769_0.188_70.08)]" />
              </div>
              <CardContent className="p-0 gap-1">
                <div className="text-sm leading-5 tracking-[2px]">
                  FIND PARTNERS
                </div>
                <div className="text-[#a1a1a1] text-[11px]">{`Search by city & category.`}</div>
              </CardContent>
            </Card>
            <Card className="bg-neutral-900 border-white/10 border-0 border-solid p-4 gap-3">
              <div className="flex justify-between items-center">
                <span className="text-[oklch(0.769_0.188_70.08)] text-[10px] tracking-[2px]">
                  04
                </span>
                <Percent className="size-4 text-[oklch(0.769_0.188_70.08)]" />
              </div>
              <CardContent className="p-0 gap-1">
                <div className="text-sm leading-5 tracking-[2px]">
                  SPECIAL ACCESS
                </div>
                <div className="text-[#a1a1a1] text-[11px]">
                  Offers available after login.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <div className="px-6 pb-8">
          <Card className="bg-neutral-900 border-white/10 border-0 border-solid p-6 gap-4">
            <div className="flex items-center gap-2">
              <div className="bg-[oklch(0.769_0.188_70.08)] w-6 h-px" />
              <span className="text-xs leading-4 tracking-[3px]">
                FIND PARTNERS
              </span>
            </div>
            <CardContent className="p-0 gap-2">
              <div className="rounded-lg bg-neutral-950 border-white/10 border-1 border-solid flex px-3 items-center gap-2 h-11">
                <Globe className="size-4 text-[#a1a1a1]" />
                <span className="text-[#a1a1a1] text-xs leading-4 flex-1">
                  All countries
                </span>
                <ChevronDown className="size-4 text-[#a1a1a1]" />
              </div>
              <div className="rounded-lg bg-neutral-950 border-white/10 border-1 border-solid flex px-3 items-center gap-2 h-11">
                <MapPin className="size-4 text-[#a1a1a1]" />
                <span className="text-[#a1a1a1] text-xs leading-4 flex-1">
                  All cities
                </span>
                <ChevronDown className="size-4 text-[#a1a1a1]" />
              </div>
              <div className="rounded-lg bg-neutral-950 border-white/10 border-1 border-solid flex px-3 items-center gap-2 h-11">
                <LayoutGrid className="size-4 text-[#a1a1a1]" />
                <span className="text-[#a1a1a1] text-xs leading-4 flex-1">
                  All categories
                </span>
                <ChevronDown className="size-4 text-[#a1a1a1]" />
              </div>
            </CardContent>
            <CardFooter className="p-0 gap-2">
              <Button className="bg-[oklch(0.769_0.188_70.08)] text-neutral-950 gap-2 w-full h-11">
                <Search className="size-4" />
                Find a Partner
              </Button>
            </CardFooter>
          </Card>
        </div>
        <div className="px-6 pb-8">
          <div className="flex mb-4 justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="bg-[oklch(0.769_0.188_70.08)] w-6 h-px" />
              <span className="text-xs leading-4 tracking-[3px]">
                RECOMMENDED
              </span>
            </div>
            <button className="text-[oklch(0.769_0.188_70.08)] text-xs leading-4 flex items-center gap-1">
              More
              <ArrowRight className="size-3" />
            </button>
          </div>
          <div className="flex flex-col gap-3">
            <Card className="bg-neutral-900 border-white/10 border-0 border-solid p-4 gap-3">
              <div className="flex items-start gap-3">
                <div className="size-11 shrink-0 rounded-lg bg-neutral-800 flex justify-center items-center">
                  <Stethoscope className="size-5 text-[oklch(0.769_0.188_70.08)]" />
                </div>
                <div className="flex-1">
                  <div className="font-serif text-base leading-6">
                    Dental Care Clinic
                  </div>
                  <div className="text-[#a1a1a1] text-xs leading-4">
                    Medical · Kyiv, Ukraine
                  </div>
                </div>
                <Bookmark className="size-4 text-[#a1a1a1]" />
              </div>
              <div className="text-[#a1a1a1] text-xs leading-4 border-white/10 border-t-1 border-r-0 border-b-0 border-l-0 border-solid flex pt-3 items-center gap-2">
                <Lock className="size-3" />
                Special conditions after registration
              </div>
            </Card>
            <Card className="bg-neutral-900 border-white/10 border-0 border-solid p-4 gap-3">
              <div className="flex items-start gap-3">
                <div className="size-11 shrink-0 rounded-lg bg-neutral-800 flex justify-center items-center">
                  <Dumbbell className="size-5 text-[oklch(0.769_0.188_70.08)]" />
                </div>
                <div className="flex-1">
                  <div className="font-serif text-base leading-6">{`Fit & Strong`}</div>
                  <div className="text-[#a1a1a1] text-xs leading-4">
                    Fitness · Berlin, Germany
                  </div>
                </div>
                <Bookmark className="size-4 text-[#a1a1a1]" />
              </div>
              <div className="text-[#a1a1a1] text-xs leading-4 border-white/10 border-t-1 border-r-0 border-b-0 border-l-0 border-solid flex pt-3 items-center gap-2">
                <Lock className="size-3" />
                Special conditions after registration
              </div>
            </Card>
            <Card className="bg-neutral-900 border-white/10 border-0 border-solid p-4 gap-3">
              <div className="flex items-start gap-3">
                <div className="size-11 shrink-0 rounded-lg bg-neutral-800 flex justify-center items-center">
                  <Plane className="size-5 text-[oklch(0.769_0.188_70.08)]" />
                </div>
                <div className="flex-1">
                  <div className="font-serif text-base leading-6">
                    Travel World
                  </div>
                  <div className="text-[#a1a1a1] text-xs leading-4">
                    Tourism · Istanbul, Turkey
                  </div>
                </div>
                <Bookmark className="size-4 text-[#a1a1a1]" />
              </div>
              <div className="text-[#a1a1a1] text-xs leading-4 border-white/10 border-t-1 border-r-0 border-b-0 border-l-0 border-solid flex pt-3 items-center gap-2">
                <Lock className="size-3" />
                Special conditions after registration
              </div>
            </Card>
          </div>
        </div>
        <div className="px-6 pb-28">
          <div className="text-[#a1a1a1] text-[10px] tracking-[2px] flex justify-center items-center gap-2">
            <Crown className="size-3 text-[oklch(0.769_0.188_70.08)]" />© 2025
            KYLYVNYK CLUB
          </div>
        </div>
        <div className="fixed bg-neutral-900 border-white/10 border-t-1 border-r-0 border-b-0 border-l-0 border-solid inset-x-0 bottom-0">
          <div className="flex px-4 py-3 justify-around items-center">
            <button className="rounded-lg bg-neutral-800 flex px-4 py-1.5 flex-col items-center gap-1">
              <Home className="size-5 text-[oklch(0.769_0.188_70.08)]" />
              <span className="text-[oklch(0.769_0.188_70.08)] text-[10px]">
                Главная
              </span>
            </button>
            <button className="flex px-4 py-1.5 flex-col items-center gap-1">
              <Grid3x3 className="size-5 text-[#a1a1a1]" />
              <span className="text-[#a1a1a1] text-[10px]">Каталог</span>
            </button>
            <button className="flex px-4 py-1.5 flex-col items-center gap-1">
              <User className="size-5 text-[#a1a1a1]" />
              <span className="text-[#a1a1a1] text-[10px]">Мой профиль</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
