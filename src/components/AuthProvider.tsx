"use client";

import { useState, useEffect } from "react";
import { auth, googleProvider } from "@/lib/firebase";
import { signInWithPopup, onAuthStateChanged, signOut, User } from "firebase/auth";
import { Bot, LogIn, Lock } from "lucide-react";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const ALLOWED_EMAIL = "yunilfelixturbi@gmail.com";

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user.email !== ALLOWED_EMAIL) {
        await signOut(auth);
        setError("Acceso denegado. Esta cuenta no tiene permisos para acceder a Mission Control.");
      }
    } catch (err: any) {
      console.error(err);
      setError("Error al iniciar sesión.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Bot size={48} className="text-primary animate-pulse" />
          <p className="text-muted-foreground font-mono text-sm">Verificando credenciales...</p>
        </div>
      </div>
    );
  }

  if (!user || user.email !== ALLOWED_EMAIL) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] opacity-50 pointer-events-none"></div>
        
        <div className="bg-card border border-border w-full max-w-md rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col items-center text-center p-8">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 border border-primary/20">
            <Lock size={32} className="text-primary" />
          </div>
          
          <h1 className="text-2xl font-bold mb-2">Acceso Restringido</h1>
          <p className="text-muted-foreground text-sm mb-8">
            Mission Control está protegido por una llave de seguridad de alto nivel. Solo el administrador principal puede acceder.
          </p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm px-4 py-3 rounded-lg mb-6 w-full text-left">
              {error}
            </div>
          )}

          <button 
            onClick={handleSignIn}
            className="w-full bg-foreground text-background hover:bg-foreground/90 font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-3 transition-colors"
          >
            <LogIn size={18} />
            Autenticar con Google
          </button>

          <p className="mt-8 text-xs text-muted-foreground font-mono opacity-50">
            v1.0.0 • yunAi.agent
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
