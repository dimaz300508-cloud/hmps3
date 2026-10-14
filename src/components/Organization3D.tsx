import React, { useState } from 'react';
import { soundManager } from '../utils/audio';
import { Users, Award, HardHat, Search, ChevronRight } from 'lucide-react';
import { DEPARTMENTS_DATA, DepartmentData } from '../data/membersData';
import { useSiteSettings } from '../data/siteSettings';

export const Organization3D: React.FC = () => {
  const settings = useSiteSettings();
  const [activeDepartment, setActiveDepartment] = useState<DepartmentData>(DEPARTMENTS_DATA[0]);
  const [viewMode, setViewMode] = useState<'interactive' | 'roster'>('interactive');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState('Semua');
  const memberRoster = settings.members;

  const matchesDepartment = (memberDepartment: string, dept: DepartmentData) => {
    const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '');
    const normalizedMember = normalize(memberDepartment);
    return [dept.name, dept.shortName].some((value) => normalize(value) === normalizedMember);
  };

  const selectDepartment = (dept: DepartmentData) => {
    soundManager.playClick();
    setActiveDepartment(dept);
  };

  const dynamicDepartmentData = settings.departments.map((configuredDepartment) => {
    const originalDepartment = DEPARTMENTS_DATA.find((department) => department.id === configuredDepartment.id);
    const department: DepartmentData = {
      ...(originalDepartment ?? {
        head: '',
        viceHead: undefined,
        description: `Pengurus Departemen ${configuredDepartment.name}.`,
        membersCount: 0,
        coordinate: [0, 0, 0] as [number, number, number],
        members: [],
      }),
      ...configuredDepartment,
      shortName: configuredDepartment.name,
      color: configuredDepartment.color,
      description: (originalDepartment?.description ?? `Pengurus Departemen ${configuredDepartment.name}.`)
        .replace(/2026-2027/g, settings.period),
      members: [],
    };
    const members = memberRoster.filter((member) =>
      matchesDepartment(member.departemen, department) ||
      (!!originalDepartment && matchesDepartment(member.departemen, originalDepartment)),
    );
    return {
      ...department,
      members,
      membersCount: members.length,
      head: members.find((member) => member.role === 'Ketua')?.name ?? department.head,
      viceHead: members.find((member) => member.role === 'Wakil')?.name ?? department.viceHead,
    };
  });
  const boardMembers = memberRoster.filter((member) => matchesDepartment(member.departemen, DEPARTMENTS_DATA[0]));
  const chair = boardMembers.find((member) => member.role === 'Ketua');
  const viceChair = boardMembers.find((member) => member.role === 'Wakil');
  const secretaries = boardMembers.filter((member) => member.role === 'Sekretaris');
  const treasurers = boardMembers.filter((member) => member.role === 'Bendahara');
  const departments = dynamicDepartmentData.filter((dept) => dept.id !== 'himpunan');

  const rosterDepartment = dynamicDepartmentData.find((dept) => dept.id === activeDepartment.id) ?? dynamicDepartmentData[0];
  const departmentDetails = rosterDepartment ?? activeDepartment;

  // Filter members in full roster view
  const filteredRoster = memberRoster.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.npm.includes(searchQuery) ||
      m.departemen.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = filterClass === 'Semua' || m.kelas === filterClass;
    return matchesSearch && matchesClass;
  });

  return (
    <section id="struktur" className="py-20 bg-slate-950/80 border-b border-amber-900/20 relative">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 tracking-wider uppercase mb-2">
              <span>Kepengurusan HMPS MATARATU Periode {settings.period}</span>
              <span aria-hidden="true">·</span>
            <span>{memberRoster.length} Anggota Resmi</span>
            </div>
            <h2 className="font-cinzel text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Struktur Organisasi & Daftar Pengurus
            </h2>
            <p className="mt-2 text-xs font-semibold text-amber-300/90 tracking-widest uppercase">
              ” Inklusif – Kolaboratif – Progresif ”
            </p>
            <p className="mt-2 text-sm text-slate-300">
              Daftar resmi seluruh jajaran struktural dan bidang HMPS MATARATU
              Program Studi Teknik Pertambangan Batubara Politeknik Akamigas Palembang.
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-lg border border-slate-800 shrink-0">
            <button
              onClick={() => {
                soundManager.playClick();
                setViewMode('interactive');
              }}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                viewMode === 'interactive' ? 'bg-amber-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Bagan Interaktif
            </button>
            <button
              onClick={() => {
                soundManager.playClick();
                setViewMode('roster');
              }}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                viewMode === 'roster' ? 'bg-amber-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Daftar Lengkap {memberRoster.length} Pengurus
            </button>
          </div>
        </div>

        {/* Department Selector Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
          {dynamicDepartmentData.map((dept) => (
            <button
              key={dept.id}
              onClick={() => selectDepartment(dept)}
              className={`px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all border shrink-0 cursor-pointer flex items-center gap-2 ${
                activeDepartment.id === dept.id
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: dept.color }} />
              <span>{dept.shortName}</span>
              <span className="text-[10px] text-slate-500 tabular-nums font-bold">({dept.membersCount})</span>
            </button>
          ))}
        </div>

        {viewMode === 'interactive' ? (
          /* INTERACTIVE SPLIT: 3D NODE CANVAS + ACTIVE DEPT INSPECTOR WITH COMPLETE MEMBER LIST */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* 3D Hierarchy Diagram */}
            <div className="lg:col-span-6 min-h-[440px] rounded-2xl border border-amber-900/40 bg-radial from-slate-900/70 to-slate-950/95 p-5 sm:p-7 relative shadow-[0_0_30px_rgba(0,0,0,0.7)]">
              <div className="mb-7 flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">Bagan Kepengurusan 3D</div>
                  <div className="mt-1 text-[11px] text-slate-400">Pilih departemen untuk melihat detail pengurus</div>
                </div>
                <span className="shrink-0 rounded-lg border border-white/10 bg-black/50 px-3 py-1.5 text-xs text-amber-300">
                  Periode {settings.period}
                </span>
              </div>

              <div className="flex flex-col items-center [perspective:1000px]">
                <div className="w-full max-w-xs rounded-2xl border border-sky-400/50 bg-gradient-to-br from-sky-400/15 via-slate-900 to-slate-950 p-3.5 text-center shadow-[0_10px_0_rgba(3,105,161,0.25),0_18px_30px_rgba(0,0,0,0.45)] [transform:rotateX(8deg)]">
                  <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-sky-300">Kaprodi Teknik Pertambangan Batubara</div>
                  <div className="mt-1.5 text-xs font-bold leading-relaxed text-white sm:text-sm">Bapak Mirza Adiwarman, S.T., M.T.</div>
                </div>

                <div className="h-5 w-px bg-sky-400/60" />
                <div className="w-full max-w-xs rounded-xl border border-sky-400/35 bg-slate-900/90 p-3.5 text-center shadow-[0_8px_0_rgba(3,105,161,0.2),0_14px_24px_rgba(0,0,0,0.4)] [transform:rotateX(7deg)]">
                  <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-sky-200">Sekretaris Prodi</div>
                  <div className="mt-1 text-xs font-semibold leading-relaxed text-slate-100">Ibuk Ir. Siti Nuryanti, S.T., M.T.</div>
                </div>

                <div className="h-5 w-px bg-gradient-to-b from-sky-400/60 to-amber-400/70" />
                <div className="w-full max-w-xs rounded-2xl border border-amber-400/70 bg-gradient-to-br from-amber-300/20 via-slate-900 to-slate-950 p-4 text-center shadow-[0_14px_0_rgba(120,53,15,0.38),0_20px_35px_rgba(0,0,0,0.55)] transition-transform duration-300 [transform:rotateX(8deg)]">
                  <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-400">Ketua Himpunan</div>
                  <div className="mt-1.5 text-sm font-bold text-white">{chair?.name ?? 'Belum ditentukan'}</div>
                </div>

                <div className="h-7 w-px bg-gradient-to-b from-amber-400/80 to-amber-400/30" />
                <div className="w-full max-w-xs rounded-xl border border-amber-500/40 bg-slate-900/90 p-3.5 text-center shadow-[0_10px_0_rgba(120,53,15,0.28),0_16px_28px_rgba(0,0,0,0.45)] transition-transform duration-300 hover:-translate-y-1 [transform:rotateX(7deg)]">
                  <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-300">Wakil Ketua</div>
                  <div className="mt-1 text-xs font-semibold text-slate-100">{viceChair?.name ?? 'Belum ditentukan'}</div>
                </div>

                <div className="h-7 w-px bg-amber-400/50" />
                <div className="grid w-full max-w-xl grid-cols-1 gap-3 sm:grid-cols-2">
                  {[
                    { title: 'Sekretaris', members: secretaries },
                    { title: 'Bendahara', members: treasurers },
                  ].map(({ title, members }) => (
                    <div key={title} className="rounded-xl border border-slate-700 bg-slate-900/90 p-3 text-center shadow-[0_8px_0_rgba(15,23,42,0.8),0_14px_24px_rgba(0,0,0,0.4)] transition-transform duration-300 hover:-translate-y-1 [transform:rotateX(6deg)]">
                      <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber-300">{title}</div>
                      {members.length > 0 ? members.map((member) => (
                        <div key={member.no} className="mt-1 text-[11px] font-medium text-slate-200">{member.name}</div>
                      )) : <div className="mt-1 text-[11px] text-slate-500">Belum ditentukan</div>}
                    </div>
                  ))}
                </div>

                <div className="h-8 w-px bg-amber-400/50" />
                <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-amber-400">Departemen</div>
                <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-3">
                  {departments.map((dept) => (
                    <button
                      key={dept.id}
                      type="button"
                      onClick={() => selectDepartment(dept)}
                      aria-pressed={activeDepartment.id === dept.id}
                      className={`min-h-[88px] rounded-xl border bg-slate-900/90 p-3 text-left shadow-[0_7px_0_rgba(15,23,42,0.85),0_12px_20px_rgba(0,0,0,0.38)] transition-all duration-300 hover:-translate-y-1 hover:bg-slate-800/90 [transform:rotateX(5deg)] ${
                        activeDepartment.id === dept.id ? 'ring-1 ring-amber-300/70' : ''
                      }`}
                      style={{ borderColor: `${dept.color}90` }}
                    >
                      <div className="truncate text-[11px] font-bold" style={{ color: dept.color }}>{dept.shortName}</div>
                      <div className="mt-1 line-clamp-2 text-[10px] leading-relaxed text-slate-300">{dept.head.replace(/\s*\([^)]*\)/, '')}</div>
                      <div className="mt-1.5 text-[9px] text-slate-500">{dept.membersCount} anggota</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-7 flex items-center justify-between gap-2 border-t border-slate-800 pt-4 text-[10px] text-slate-400 sm:text-xs">
                <span>Himpunan & {departments.length} Departemen</span>
                <span className="font-medium text-amber-300">Total {memberRoster.length} Kader Aktif</span>
              </div>
            </div>

            {/* Department Inspector Details */}
            <div className="lg:col-span-6 rounded-2xl border border-amber-500/30 bg-slate-900/60 p-6 sm:p-7 flex flex-col justify-between shadow-[0_0_20px_rgba(245,158,11,0.1)]">
              <div>
                <div className="flex items-center justify-between gap-4 mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <HardHat className="w-3.5 h-3.5" />
                    <span>Detail Kepengurusan</span>
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-slate-300 bg-slate-950/80 px-2.5 py-1 rounded-md border border-slate-800">
                    <Users className="w-3.5 h-3.5 text-amber-400" />
                    <span className="tabular-nums font-bold text-amber-300">{departmentDetails.membersCount}</span> Anggota
                  </div>
                </div>

                <h3 className="font-cinzel text-xl sm:text-2xl font-bold text-white mb-2">
                  {departmentDetails.name}
                </h3>

                {/* Leaders Box */}
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 my-3 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs">
                    <Award className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="text-slate-400">Ketua:</span>
                    <strong className="text-amber-200">{departmentDetails.head}</strong>
                  </div>
                  {departmentDetails.viceHead && (
                    <div className="flex items-center gap-2 text-xs pl-6">
                      <span className="text-slate-400">Wakil Ketua:</span>
                      <strong className="text-slate-200">{departmentDetails.viceHead}</strong>
                    </div>
                  )}
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  {departmentDetails.description}
                </p>

                {/* Table of Members in this Department */}
                <div>
                  <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>Daftar Anggota Departemen ({departmentDetails.members.length})</span>
                    <span className="text-[10px] text-slate-500">NPM & Kelas Resmi</span>
                  </div>

                  <div className="max-h-[220px] overflow-y-auto rounded-xl border border-slate-800 bg-slate-950/70 divide-y divide-slate-800/80 text-xs sm:max-h-none sm:overflow-visible">
                    {departmentDetails.members.map((m) => (
                      <div key={m.no} className="px-3.5 py-2.5 flex items-center justify-between hover:bg-slate-900/50 transition-colors">
                        <div className="flex min-w-0 flex-1 items-center gap-2.5 pr-2">
                          <span className="w-5 text-[10px] text-slate-500 font-mono text-right shrink-0">{m.no}.</span>
                          <div className="min-w-0">
                            <div className="font-semibold whitespace-normal break-words text-slate-100">{m.name}</div>
                            <div className="text-[10px] text-amber-400/90 font-mono">NPM: {m.npm}</div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-300 font-medium">
                            {m.kelas}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>SK Kepengurusan: Periode {settings.period}</span>
                <button
                  onClick={() => setViewMode('roster')}
                  className="text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium transition-colors cursor-pointer"
                >
                  <span>Lihat Seluruh {memberRoster.length} Pengurus</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>
        ) : (
          /* FULL ROSTER TABLE (ALL 75 MEMBERS) */
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8">
            
            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari nama, NPM, atau departemen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto text-xs">
                <span className="text-slate-400 whitespace-nowrap">Filter Kelas:</span>
                {['Semua', 'TPB 5A', 'TPB 5B', 'TPB 5C', 'TPB 3A', 'TPB 3B', 'TPB 3C'].map((cls) => (
                  <button
                    key={cls}
                    onClick={() => setFilterClass(cls)}
                    className={`px-2.5 py-1 rounded-lg border text-xs font-medium whitespace-nowrap cursor-pointer transition-colors ${
                      filterClass === cls
                        ? 'bg-amber-500 text-slate-950 border-amber-400 font-semibold'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {cls}
                  </button>
                ))}
              </div>
            </div>

            {/* Roster Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4 w-12 text-center">No</th>
                    <th className="py-3 px-4">Nama Lengkap</th>
                    <th className="py-3 px-4">NPM</th>
                    <th className="py-3 px-4">Kelas</th>
                    <th className="py-3 px-4">Departemen</th>
                    <th className="py-3 px-4">Jabatan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 bg-slate-900/30">
                  {filteredRoster.length > 0 ? (
                    filteredRoster.map((m) => (
                      <tr key={m.no} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 font-mono text-center text-slate-500">{m.no}</td>
                        <td className="py-3 px-4 font-semibold text-slate-100">{m.name}</td>
                        <td className="py-3 px-4 font-mono text-amber-300/90 font-medium">{m.npm}</td>
                        <td className="py-3 px-4 font-mono text-slate-300">
                          <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                            {m.kelas}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-300">{m.departemen}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            m.role === 'Ketua' 
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : m.role === 'Wakil'
                              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                              : m.role === 'Sekretaris' || m.role === 'Bendahara'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : m.role === 'PJ'
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                              : 'bg-slate-800 text-slate-400'
                          }`}>
                            {m.role === 'Ketua' ? 'Ketua' : m.role === 'Wakil' ? 'Wakil Ketua' : m.role}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-400">
                        Tidak ada pengurus yang cocok dengan kata kunci pencarian.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
              <span>Menampilkan {filteredRoster.length} dari 75 pengurus resmi</span>
              <button
                onClick={() => setViewMode('interactive')}
                className="text-amber-400 hover:text-amber-300 font-medium cursor-pointer"
              >
                Kembali ke Bagan Interaktif
              </button>
            </div>

          </div>
        )}

      </div>
    </section>
  );
};
