"use client";

import ProfileForm from "./profile-form";
import { UserContext } from "@/contexts/UserContext";
import { sendRequest } from "@/lib/axios";
import { useContext, useState, useEffect } from "react";

const defaultAvatar = "https://iili.io/2D8ByIj.png";
const defaultCover = "https://iili.io/2bE295P.png";

export default function ProfileView() {
  const { myUserData } = useContext(UserContext);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    username: "",
    status: "",
    avatar: defaultAvatar,
    cover: defaultCover,
  });

  useEffect(() => {
    setFormData({
      first_name: myUserData?.first_name ?? "",
      last_name: myUserData?.last_name ?? "",
      username: myUserData?.username ?? "",
      status: myUserData?.status ?? "",
      avatar: myUserData?.avatar ?? defaultAvatar,
      cover: myUserData?.cover ?? defaultCover,
    });
  }, [myUserData]);

  const openFilePicker = (id: string, type: string) => {
    const fileInput = document.getElementById(id);
    if (fileInput) {
      fileInput.click();
    }
  };

  const uploadImage = (file: File, type: string) => {
    const form = new FormData();
    form.append("image", file);

    sendRequest("post", "/users/upload-image/", form)
      .then((res) => {
        console.log(res.data);
        if (type === "cover") {
          setFormData({ ...formData, cover: res.data.url });
        } else {
          setFormData({ ...formData, avatar: res.data.url });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <div className="w-full h-full">
      <input
        type="file"
        id="cover-input"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            uploadImage(file, "cover");
          }
        }}
      />
      <input
        type="file"
        id="avatar-input"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            uploadImage(file, "avatar");
          }
        }}
      />
      <div className="relative w-full h-[250px]">
        <img
          src={formData.cover}
          className="w-full h-full object-cover"
          style={{
            maskImage: "linear-gradient(to top, transparent, black 50%, black)",
            WebkitMaskImage:
              "linear-gradient(to top, transparent, black 50%, black)",
          }}
        />
        <img
          id="cover-edit"
          src="/assets/icons/pencil.svg"
          alt="Edit"
          className="w-7 h-7 absolute top-0 end-0 m-2 cursor-pointer"
          onClick={() => openFilePicker("cover-input", "cover")}
        />

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-36 h-36 rounded-full overflow-hidden">
          <img src={formData.avatar} className="w-full h-full object-cover" />
          <div className="bg-gradient-to-b from-transparent via-black/50 to-black/100 absolute inset-0 top-1/2" />
          <img
            id="avatar-edit"
            src="/assets/icons/pencil.svg"
            alt="Edit"
            className="w-5 h-5 absolute bottom-1 left-1/2 -translate-x-1/2 cursor-pointer"
            onClick={() => openFilePicker("avatar-input", "avatar")}
          />
        </div>
      </div>
      <ProfileForm formData={formData} setFormData={setFormData} />
    </div>
  );
}
