"use client";

import { Frame, TitleBar, Cursor, Button } from "@react95/core";
import { FileText } from "@react95/icons";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import BottomNav from "@/components/BottomNav";
import type { Locale } from "@/app/[lang]/dictionaries";
import styles from "./page.module.css";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Dict {
  myProducts: {
    title: string;
    newProductTitle: string;
    name: string;
    namePlaceholder: string;
    description: string;
    descriptionPlaceholder: string;
    price: string;
    pricePlaceholder: string;
    originalPrice: string;
    originalPricePlaceholder: string;
    year: string;
    yearPlaceholder: string;
    manufacturer: string;
    manufacturerPlaceholder: string;
    stock: string;
    stockPlaceholder: string;
    category: string;
    selectCategory: string;
    images: string;
    imagesPlaceholder: string;
    publish: string;
    publishing: string;
    published: string;
    publishError: string;
    requiredFields: string;
    backToUserPanel: string;
  };
  navigation: {
    start: string;
    home: string;
    products: string;
    myProfile: string;
    userPanel: string;
    login: string;
    favorites: string;
    cart: string;
  };
}

interface UserWithAvatar {
  sub: string;
  email: string;
  role: string;
  name: string;
  avatar: string | null;
}

export default function NewProductPage() {
  const params = useParams();
  const router = useRouter();
  const lang = params.lang as Locale;

  const [dict, setDict] = useState<Dict | null>(null);
  const [user, setUser] = useState<UserWithAvatar | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [year, setYear] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [stock, setStock] = useState("0");
  const [categoryId, setCategoryId] = useState("");
  const [images, setImages] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dictModule, userRes, categoriesRes] = await Promise.all([
          import(`@/dictionaries/${lang}.json`).then((m) => m.default),
          fetch("/api/user/profile"),
          fetch("/api/categories"),
        ]);

        setDict(dictModule as Dict);

        if (userRes.ok) {
          const responseData = await userRes.json();
          const userData = responseData.user;
          setUser({
            sub: userData.id,
            email: userData.email,
            role: userData.role || "USER",
            name: userData.name || "",
            avatar: userData.avatar || null,
          });
        } else {
          router.push(`/${lang}/login`);
          return;
        }

        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json();
          setCategories(categoriesData);
        }
      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [lang, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dict) return;

    if (!name.trim() || !price.trim() || !categoryId) {
      setError(dict.myProducts.requiredFields);
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const imageList = images
        .split("\n")
        .map((url) => url.trim())
        .filter((url) => url.length > 0);

      const res = await fetch("/api/user/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          price: parseFloat(price),
          originalPrice: originalPrice.trim()
            ? parseFloat(originalPrice)
            : parseFloat(price),
          year: year.trim() ? parseInt(year) : null,
          manufacturer: manufacturer.trim() || null,
          stock: parseInt(stock) || 0,
          categoryId,
          images: imageList,
        }),
      });

      if (res.ok) {
        setSuccess(dict.myProducts.published);
        setTimeout(() => {
          router.push(`/${lang}/user/products`);
        }, 1500);
      } else {
        const data = await res.json();
        setError(data.error || dict.myProducts.publishError);
      }
    } catch {
      setError(dict.myProducts.publishError);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !dict) {
    return (
      <div className={styles.container}>
        <div className={styles.main}>
          <p className={styles.loadingText}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {user && <BottomNav lang={lang} dict={dict.navigation} user={user} />}

      <div className={styles.main}>
        <div className={styles.window}>
          <TitleBar
            active
            icon={<FileText variant="16x16_4" />}
            title={dict.myProducts.newProductTitle}
          >
            <TitleBar.OptionsBox>
              <TitleBar.Minimize />
              <TitleBar.Restore />
              <TitleBar.Close />
            </TitleBar.OptionsBox>
          </TitleBar>

          <Frame className={styles.windowContent}>
            <form onSubmit={handleSubmit} className={styles.form}>
              {/* Name */}
              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="name">
                  {dict.myProducts.name} *
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={dict.myProducts.namePlaceholder}
                  className={styles.input}
                  required
                />
              </div>

              {/* Description */}
              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="description">
                  {dict.myProducts.description}
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={dict.myProducts.descriptionPlaceholder}
                  className={styles.textarea}
                  rows={4}
                />
              </div>

              {/* Price and Original Price */}
              <div className={styles.fieldRow}>
                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="price">
                    {dict.myProducts.price} *
                  </label>
                  <input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder={dict.myProducts.pricePlaceholder}
                    className={styles.input}
                    required
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="originalPrice">
                    {dict.myProducts.originalPrice}
                  </label>
                  <input
                    id="originalPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    placeholder={dict.myProducts.originalPricePlaceholder}
                    className={styles.input}
                  />
                </div>
              </div>

              {/* Year and Manufacturer */}
              <div className={styles.fieldRow}>
                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="year">
                    {dict.myProducts.year}
                  </label>
                  <input
                    id="year"
                    type="number"
                    min="1970"
                    max="2010"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    placeholder={dict.myProducts.yearPlaceholder}
                    className={styles.input}
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="manufacturer">
                    {dict.myProducts.manufacturer}
                  </label>
                  <input
                    id="manufacturer"
                    type="text"
                    value={manufacturer}
                    onChange={(e) => setManufacturer(e.target.value)}
                    placeholder={dict.myProducts.manufacturerPlaceholder}
                    className={styles.input}
                  />
                </div>
              </div>

              {/* Stock and Category */}
              <div className={styles.fieldRow}>
                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="stock">
                    {dict.myProducts.stock}
                  </label>
                  <input
                    id="stock"
                    type="number"
                    min="0"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    placeholder={dict.myProducts.stockPlaceholder}
                    className={styles.input}
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="category">
                    {dict.myProducts.category} *
                  </label>
                  <select
                    id="category"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className={styles.select}
                    required
                  >
                    <option value="">{dict.myProducts.selectCategory}</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Images */}
              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="images">
                  {dict.myProducts.images}
                </label>
                <textarea
                  id="images"
                  value={images}
                  onChange={(e) => setImages(e.target.value)}
                  placeholder={dict.myProducts.imagesPlaceholder}
                  className={styles.textarea}
                  rows={3}
                />
              </div>

              {/* Error / Success messages */}
              {error && <p className={styles.errorMessage}>{error}</p>}
              {success && <p className={styles.successMessage}>{success}</p>}

              {/* Actions */}
              <div className={styles.formActions}>
                <Button
                  type="submit"
                  disabled={submitting}
                  className={`${styles.submitButton} ${Cursor.Pointer}`}
                >
                  {submitting
                    ? dict.myProducts.publishing
                    : dict.myProducts.publish}
                </Button>

                <Link
                  href={`/${lang}/user/products`}
                  className={`${styles.backLink} ${Cursor.Pointer}`}
                >
                  {dict.myProducts.backToUserPanel}
                </Link>
              </div>
            </form>
          </Frame>
        </div>
      </div>
    </div>
  );
}
