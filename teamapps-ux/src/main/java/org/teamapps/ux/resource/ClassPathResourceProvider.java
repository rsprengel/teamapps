/*-
 * ========================LICENSE_START=================================
 * TeamApps
 * ---
 * Copyright (C) 2014 - 2019 TeamApps.org
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
package org.teamapps.ux.resource;

import com.google.common.annotations.VisibleForTesting;

import java.io.InputStream;

public class ClassPathResourceProvider implements ResourceProvider {

	private final String basePackage;

	public ClassPathResourceProvider(String basePackage) {
		this.basePackage = normalizeClassPathResourcePath(basePackage);
	}

	@Override
	public Resource getResource(String servletPath, String relativeResourcePath, String sessionId) {
		return new ClassPathResource(getJavaResourceName(relativeResourcePath));
	}

	private String getJavaResourceName(String resource) {
		return basePackage + resource;
	}

	@VisibleForTesting
	static String normalizeClassPathResourcePath(String basePackage) {
		if (!basePackage.contains("/") && basePackage.contains(".")) {
			basePackage = basePackage.replaceAll("\\.", "/");
		}
		if (!basePackage.startsWith("/")) {
			basePackage = "/" + basePackage;
		}
		if (basePackage.endsWith("/")) {
			basePackage = basePackage.substring(0, basePackage.length() - 1);
		}
		return basePackage;
	}

	private class ClassPathResource implements Resource {

		private final String resourceName;
		private Long cachedSize;

		public ClassPathResource(String resourceName) {
			this.resourceName = resourceName;
		}

		@Override
		public InputStream getInputStream() {
			return getClass().getResourceAsStream(resourceName);
		}

		@Override
		public long getLength() {
			if (cachedSize == null) {
				cachedSize = Resource.super.getLength();
			}
			return cachedSize;
		}
	}
}
