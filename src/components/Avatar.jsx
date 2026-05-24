import React from "react";

const getInitials = (name = "") => {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
};

const getGradientColor = (name = "") => {
  const colors = [
    "from-emerald-400 to-teal-500",
    "from-blue-400 to-indigo-500",
    "from-purple-400 to-pink-500",
    "from-rose-400 to-orange-500",
    "from-amber-400 to-yellow-500",
    "from-violet-400 to-purple-600",
    "from-cyan-400 to-blue-500"
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

export const Avatar = ({ src, name = "", size = "md", className = "" }) => {
  const sizes = {
    xs: "w-6 h-6 text-xs",
    sm: "w-8 h-8 text-sm",
    md: "w-10 h-10 text-base font-semibold",
    lg: "w-12 h-12 text-lg font-semibold",
    xl: "w-16 h-16 text-xl font-bold",
    xxl: "w-20 h-20 text-2xl font-bold"
  };

  const selectedSize = sizes[size] || sizes.md;

  if (src && src.trim() !== "") {
    return (
      <img
        src={src}
        alt={name}
        className={`${selectedSize} rounded-full object-cover border border-slate-100 dark:border-slate-800 shadow-sm ${className}`}
        onError={(e) => {
          e.target.style.display = "none";
          e.target.nextSibling.style.display = "flex";
        }}
      />
    );
  }

  const initials = getInitials(name);
  const gradient = getGradientColor(name);

  return (
    <div
      className={`${selectedSize} rounded-full flex items-center justify-center bg-gradient-to-tr ${gradient} text-white shadow-sm font-sans ${className}`}
    >
      {initials || "?"}
    </div>
  );
};
