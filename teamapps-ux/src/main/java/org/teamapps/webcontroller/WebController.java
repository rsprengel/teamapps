/*-
 * ========================LICENSE_START=================================
 * TeamApps
 * ---
 * Copyright (C) 2014 - 2020 TeamApps.org
 * ---
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *      http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =========================LICENSE_END==================================
 */
package org.teamapps.webcontroller;

import org.teamapps.icon.material.MaterialIconProvider;
import org.teamapps.icons.api.IconTheme;
import org.teamapps.icons.provider.IconProvider;
import org.teamapps.server.ServletRegistration;
import org.teamapps.server.UxServerContext;
import org.teamapps.ux.session.SessionContext;

import java.util.Collection;
import java.util.Collections;
import java.util.List;

public interface WebController {

	void onSessionStart(SessionContext sessionContext);

	default Collection<ServletRegistration> getServletRegistrations(UxServerContext serverContext) {
		return Collections.emptyList();
	}

	default IconTheme getDefaultIconTheme(boolean isMobile) {
		IconProvider iconProvider = getIconProvider();
		if (isMobile) {
			return IconTheme.of(iconProvider.getDefaultMobileStyle(), iconProvider.getDefaultSubIconStyle());
		} else {
			return IconTheme.of(iconProvider.getDefaultDesktopStyle(), iconProvider.getDefaultSubIconStyle());
		}
	}

	default IconProvider getIconProvider() {
		return new MaterialIconProvider();
	}

	default List<IconProvider> getAdditionalIconProvider() {
		return null;
	}

	/**
	 * Invoked to invalidate the WebController as a whole (not only for a specific session).
	 * This is usually when the ServletContext is about to be shut down.
	 */
	default void destroy() {
		// do nothing by default
	}

}
